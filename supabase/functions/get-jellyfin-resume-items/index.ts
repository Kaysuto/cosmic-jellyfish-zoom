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

  async getResumeItems() {
    if (!this.userId) await this.authenticate();
    const fields = 'ProviderIds,PremiereDate,Overview,Genres,ImageTags,VoteAverage,RunTimeTicks,Type,SeriesProviderIds,SeriesName,SeriesId,SeriesPrimaryImageTag';
    const url = `${this.baseUrl}/Users/${this.userId}/Items/Resume?Recursive=true&Fields=${fields}&Limit=20&IncludeItemTypes=Movie,Episode`;
    const response = await fetch(url, { headers: await this.getAuthHeaders() });
    if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Could not read error body');
        console.error("Jellyfin API Error on /Items/Resume:", response.status, errorBody);
        throw new Error(`Failed to fetch resume items from Jellyfin: ${response.status}`);
    }
    const data = await response.json();
    return data.Items || [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
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

    const jellyfin = new JellyfinClient(settings.url, settings.api_key);
    const resumeItems = await jellyfin.getResumeItems();

    if (resumeItems.length === 0) {
      return new Response(JSON.stringify([]), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const formattedItems = resumeItems.map((item: any) => {
      let tmdbId, mediaType, title, posterPath;

      if (item.Type === 'Movie') {
        tmdbId = item.ProviderIds?.Tmdb ? parseInt(item.ProviderIds.Tmdb, 10) : null;
        mediaType = 'movie';
        title = item.Name;
        if (item.ImageTags?.Primary) {
          posterPath = `${settings.url}/Items/${item.Id}/Images/Primary?tag=${item.ImageTags.Primary}`;
        }
      } else if (item.Type === 'Episode') {
        tmdbId = item.SeriesProviderIds?.Tmdb ? parseInt(item.SeriesProviderIds.Tmdb, 10) : null;
        mediaType = 'tv';
        title = item.SeriesName;
        if (item.SeriesPrimaryImageTag) {
          posterPath = `${settings.url}/Items/${item.SeriesId}/Images/Primary?tag=${item.SeriesPrimaryImageTag}`;
        }
      } else {
        return null;
      }

      if (!tmdbId) return null;

      return {
        id: tmdbId,
        title: title,
        name: title,
        media_type: mediaType,
        poster_path: posterPath || null,
        playback_position_ticks: item.UserData.PlaybackPositionTicks,
        runtime_ticks: item.RunTimeTicks,
      };
    }).filter(Boolean);

    return new Response(JSON.stringify(formattedItems), {
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