/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
// @ts-nocheck

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

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

  async findEpisode(seriesJellyfinId: string, seasonNumber: number, episodeNumber: number) {
    if (!this.userId) await this.authenticate();
    // Fetch episodes for the show with given season filter
    const url = `${this.baseUrl}/Shows/${seriesJellyfinId}/Episodes?season=${seasonNumber}&userId=${this.userId}&fields=ParentIndexNumber,IndexNumber`;
    const response = await fetch(url, {
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Failed to fetch episodes from Jellyfin: ${response.status} ${body}`);
    }
    const data = await response.json();
    if (!data.Items) return null;
    const episode = data.Items.find((ep: any) => ep.IndexNumber === episodeNumber);
    return episode || null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { seriesJellyfinId, seasonNumber, episodeNumber } = await req.json();

    if (!seriesJellyfinId || seasonNumber === undefined || episodeNumber === undefined) {
      return new Response(JSON.stringify({ error: 'seriesJellyfinId, seasonNumber and episodeNumber are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = {
      // Not using supabase client here; we only need Jellyfin API credentials stored in env via jellyfin_settings
    };

    // Read Jellyfin settings from environment if provided (prefer env), otherwise try to get from DB
    const JF_URL = Deno.env.get('JELLYFIN_URL') || '';
    const JF_API_KEY = Deno.env.get('JELLYFIN_API_KEY') || '';

    let jellyfinUrl = JF_URL;
    let jellyfinApiKey = JF_API_KEY;

    if (!jellyfinUrl || !jellyfinApiKey) {
      // Try to read from Supabase settings table (requires service role key) - but edge functions shouldn't call project DB directly without keys,
      // so prefer environment variables. If not present, return not configured.
      return new Response(JSON.stringify({ error: 'Jellyfin settings not configured for this function (set JELLYFIN_URL and JELLYFIN_API_KEY).' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const jellyfin = new JellyfinClient(jellyfinUrl, jellyfinApiKey);
    const ep = await jellyfin.findEpisode(seriesJellyfinId, Number(seasonNumber), Number(episodeNumber));

    return new Response(JSON.stringify({ exists: !!ep }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('check-jellyfin-episode-exists error:', error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})