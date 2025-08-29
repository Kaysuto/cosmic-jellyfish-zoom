/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

class JellyfinClient {
  baseUrl: string;
  apiKey: string;
  userId?: string;
  accessToken?: string;
  useDirectToken = false;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.apiKey = apiKey;
  }

  async authenticate() {
    try {
      const authResponse = await fetch(`${this.baseUrl}/Users/AuthenticateWithKey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Emby-Authorization': `MediaBrowser ApiKey="${this.apiKey}"`,
        },
      });
      if (!authResponse.ok) throw new Error(`AuthenticateWithKey failed`);
      const authData = await authResponse.json();
      this.accessToken = authData.AccessToken;
      this.userId = authData.User.Id;
    } catch (authErr) {
      const directTokenResponse = await fetch(`${this.baseUrl}/Users`, {
        headers: { 'X-Emby-Token': this.apiKey, 'Content-Type': 'application/json' },
      });
      if (directTokenResponse.ok) {
        this.useDirectToken = true;
        const users = await directTokenResponse.json();
        const adminUser = users.find(u => u.Policy?.IsAdministrator);
        this.userId = adminUser ? adminUser.Id : users[0]?.Id;
        if (!this.userId) throw new Error('Direct token auth succeeded, but could not retrieve a user ID.');
      } else {
        throw new Error('Jellyfin authentication failed for both standard and direct token methods.');
      }
    }
  }

  private async getAuthHeaders() {
    if (this.useDirectToken) {
      return { 'Content-Type': 'application/json', 'X-Emby-Token': this.apiKey };
    }
    if (!this.accessToken) throw new Error('Not authenticated.');
    return {
      'Content-Type': 'application/json',
      'X-Emby-Authorization': `MediaBrowser ApiKey="${this.apiKey}", Token="${this.accessToken}"`,
    };
  }

  getToken() {
    if (this.useDirectToken) {
      return this.apiKey;
    }
    return this.accessToken;
  }

  async getPlaybackInfo(itemId: string) {
    if (!this.userId) await this.authenticate();
    const url = `${this.baseUrl}/Items/${itemId}/PlaybackInfo?userId=${this.userId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Failed to fetch PlaybackInfo for item ${itemId}: ${response.status} ${body}`);
    }
    return await response.json();
  }

  async findEpisode(seriesJellyfinId: string, seasonNumber: number, episodeNumber: number) {
    if (!this.userId) await this.authenticate();
    const url = `${this.baseUrl}/Shows/${seriesJellyfinId}/Episodes?season=${seasonNumber}&userId=${this.userId}&fields=ParentIndexNumber,IndexNumber,Chapters,MediaSources`;
    const response = await fetch(url, { headers: await this.getAuthHeaders() });
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Failed to fetch episodes from Jellyfin for season ${seasonNumber}: ${response.status}. ${errorBody}`);
    }
    const data = await response.json();
    
    const episode = data.Items.find(ep => ep.IndexNumber === episodeNumber);
    return episode;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { seriesTmdbId, seasonNumber, episodeNumber, audioStreamIndex, subtitleStreamIndex } = await req.json();
    if (seriesTmdbId === undefined || seasonNumber === undefined || episodeNumber === undefined) {
      throw new Error("seriesTmdbId, seasonNumber, and episodeNumber are required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('jellyfin_settings')
      .select('url, api_key')
      .single();
    if (settingsError || !settings || !settings.url || !settings.api_key) {
      throw new Error('Jellyfin settings are not configured.');
    }

    const { data: catalogItem, error: catalogError } = await supabaseAdmin
      .from('catalog_items')
      .select('jellyfin_id')
      .eq('tmdb_id', Number(seriesTmdbId))
      .eq('media_type', 'tv')
      .single();
    if (catalogError || !catalogItem || !catalogItem.jellyfin_id) {
      throw new Error("This series was not found in your Jellyfin catalog.");
    }
    const seriesJellyfinId = catalogItem.jellyfin_id;

    const jellyfin = new JellyfinClient(settings.url, settings.api_key);
    const episode = await jellyfin.findEpisode(seriesJellyfinId, seasonNumber, episodeNumber);

    if (!episode) {
      throw new Error(`Episode S${seasonNumber}E${episodeNumber} not found on Jellyfin for this series.`);
    }
    const episodeJellyfinId = episode.Id;

    const playbackInfo = await jellyfin.getPlaybackInfo(episodeJellyfinId);
    const mediaSource = playbackInfo.MediaSources?.[0];
    if (!mediaSource) {
        throw new Error("No media sources found for this episode on Jellyfin.");
    }

    const sessionToken = jellyfin.getToken();
    
    let streamUrl = `${settings.url}/Videos/${episodeJellyfinId}/main.m3u8?MediaSourceId=${mediaSource.Id}&api_key=${sessionToken}`;
    if (audioStreamIndex) streamUrl += `&AudioStreamIndex=${audioStreamIndex}`;
    if (subtitleStreamIndex) streamUrl += `&SubtitleStreamIndex=${subtitleStreamIndex}`;

    const audioTracks = (mediaSource.MediaStreams || []).filter((s: any) => s.Type === 'Audio');
    const subtitleTracks = (mediaSource.MediaStreams || [])
      .filter((s: any) => s.Type === 'Subtitle')
      .map((s: any) => ({
        ...s,
        src: `${settings.url}/Videos/${episodeJellyfinId}/${mediaSource.Id}/Subtitles/${s.Index}/stream.vtt?api_key=${sessionToken}`
      }));

    return new Response(JSON.stringify({ 
      streamUrl, 
      title: episode.Name, 
      container: 'application/x-mpegURL',
      chapters: episode.Chapters || [],
      audioTracks,
      subtitleTracks,
      totalDuration: episode.RunTimeTicks ? episode.RunTimeTicks / 10000000 : 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})