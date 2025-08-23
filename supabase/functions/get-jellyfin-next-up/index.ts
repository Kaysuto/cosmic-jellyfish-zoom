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

  async getNextUpEpisode(seriesId: string) {
    if (!this.userId) await this.authenticate();
    const url = `${this.baseUrl}/Users/${this.userId}/Items/NextUp?SeriesId=${seriesId}&Limit=1`;
    const response = await fetch(url, { headers: await this.getAuthHeaders() });
    if (!response.ok) return null;
    const data = await response.json();
    return data.Items?.[0];
  }

  async getFirstEpisode(seriesId: string) {
    if (!this.userId) await this.authenticate();
    const url = `${this.baseUrl}/Users/${this.userId}/Items?ParentId=${seriesId}&Recursive=true&IncludeItemTypes=Episode&SortBy=ParentIndexNumber,IndexNumber&SortOrder=Ascending&Limit=1&fields=ParentIndexNumber,IndexNumber`;
    const response = await fetch(url, { headers: await this.getAuthHeaders() });
    if (!response.ok) return null;
    const data = await response.json();
    return data.Items?.[0];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { seriesJellyfinId } = await req.json();
    if (!seriesJellyfinId) {
      throw new Error("seriesJellyfinId is required");
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

    const jellyfin = new JellyfinClient(settings.url, settings.api_key);
    let nextEpisode = await jellyfin.getNextUpEpisode(seriesJellyfinId);

    if (!nextEpisode) {
      nextEpisode = await jellyfin.getFirstEpisode(seriesJellyfinId);
    }

    if (!nextEpisode) {
      throw new Error("Could not find any episodes for this series on Jellyfin.");
    }

    return new Response(JSON.stringify({
      episodeId: nextEpisode.Id,
      seasonNumber: nextEpisode.ParentIndexNumber,
      episodeNumber: nextEpisode.IndexNumber,
      title: nextEpisode.Name,
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