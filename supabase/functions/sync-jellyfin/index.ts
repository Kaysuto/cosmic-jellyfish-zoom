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

      if (!authResponse.ok) {
        throw new Error(`AuthenticateWithKey failed with status ${authResponse.status}`);
      }

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
        if (Array.isArray(users) && users.length > 0) {
          const adminUser = users.find(u => u.Policy?.IsAdministrator);
          this.userId = adminUser ? adminUser.Id : users[0].Id;
        } else {
          throw new Error('Direct token auth succeeded, but could not retrieve a user ID.');
        }
      } else {
        throw new Error('Jellyfin authentication failed for both standard and direct token methods.');
      }
    }
  }

  private async getAuthHeaders() {
    if (this.useDirectToken) {
      return {
        'Content-Type': 'application/json',
        'X-Emby-Token': this.apiKey,
      };
    }
    if (!this.accessToken) throw new Error('Not authenticated.');
    return {
      'Content-Type': 'application/json',
      'X-Emby-Authorization': `MediaBrowser ApiKey="${this.apiKey}", Token="${this.accessToken}"`,
    };
  }

  async getViews() {
    if (!this.userId) await this.authenticate();
    const response = await fetch(`${this.baseUrl}/Users/${this.userId}/Views`, {
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Failed to fetch Jellyfin views: ${response.status} ${body}`);
    }
    return await response.json();
  }

  async getLibraryItemsPage(viewId: string, startIndex: number, limit: number) {
    if (!this.userId) await this.authenticate();
    const fields = 'ProviderIds,PremiereDate,Overview,Genres,ImageTags,VoteAverage';
    const url = `${this.baseUrl}/Users/${this.userId}/Items?ParentId=${viewId}&Recursive=true&IncludeItemTypes=Movie,Series&fields=${fields}&StartIndex=${startIndex}&Limit=${limit}`;
    const response = await fetch(url, {
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Failed to fetch items for view ${viewId} at index ${startIndex}: ${response.status} ${body}`);
    }
    return await response.json();
  }

  async getAllEpisodesForSeries(seriesId: string) {
    if (!this.userId) await this.authenticate();
    // Request additional fields (Name and ImageTags) so we can store episode title and still image
    const url = `${this.baseUrl}/Shows/${seriesId}/Episodes?userId=${this.userId}&fields=ParentIndexNumber,IndexNumber,ProviderIds,Name,ImageTags`;
    const response = await fetch(url, { headers: await this.getAuthHeaders() });
    if (!response.ok) {
      console.error(`Could not fetch episodes for series ${seriesId}. Status: ${response.status}`);
      return [];
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

    if (settingsError) {
      const message = `Failed to fetch Jellyfin settings: ${settingsError.message || settingsError}`;
      return new Response(JSON.stringify({ ok: false, error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
    if (!settings || !settings.url || !settings.api_key) {
      const message = 'Jellyfin URL or API key is not configured in settings.';
      return new Response(JSON.stringify({ ok: false, error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const jellyfin = new JellyfinClient(settings.url, settings.api_key);
    await jellyfin.authenticate();

    const reqBody = await req.json().catch(() => ({}));
    const viewId = reqBody.viewId;
    const startIndex = Number(reqBody.startIndex || 0);
    const limit = 200;

    if (!viewId) {
      const viewsData = await jellyfin.getViews();
      const views = (viewsData.Items || []).map((v: any) => ({
        id: v.Id,
        name: v.Name,
        totalItems: v.TotalRecordCount || 0,
      }));
      return new Response(JSON.stringify({ ok: true, views }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const pageData = await jellyfin.getLibraryItemsPage(viewId, startIndex, limit);

    if (!pageData || !pageData.Items || pageData.Items.length === 0) {
      return new Response(JSON.stringify({ ok: true, itemsProcessed: 0, isViewDone: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const excludedName = "kaï";
    const filteredItems = (pageData.Items || []).filter((item: any) => !(item.Name && item.Name.toLowerCase().includes(excludedName)));

    const catalogItems = filteredItems.map((item: any) => {
      const releaseDate = item.PremiereDate ? new Date(item.PremiereDate).toISOString().split('T')[0] : null;
      const posterPath = item.ImageTags?.Primary ? `Items/${item.Id}/Images/Primary?tag=${item.ImageTags.Primary}` : null;
      const backdropPath = item.ImageTags?.Backdrop ? `Items/${item.Id}/Images/Backdrop?tag=${item.ImageTags.Backdrop}` : null;

      return {
        jellyfin_id: item.Id,
        media_type: item.Type === 'Series' ? 'tv' : 'movie',
        title: item.Name,
        overview: item.Overview,
        poster_path: posterPath,
        backdrop_path: backdropPath,
        release_date: releaseDate,
        tmdb_id: item.ProviderIds?.Tmdb ? parseInt(item.ProviderIds.Tmdb, 10) : null,
        tvdb_id: item.ProviderIds?.Tvdb ? parseInt(item.ProviderIds.Tvdb, 10) : null,
        genres: item.Genres,
        vote_average: item.CommunityRating,
      };
    }).filter((it: any) => it.jellyfin_id && it.title);

    if (catalogItems.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from('catalog_items')
        .upsert(catalogItems, { onConflict: 'jellyfin_id' });

      if (upsertError) {
        throw new Error(`Failed to save items: ${upsertError.message || upsertError}`);
      }
    }

    const seriesItems = filteredItems.filter(item => item.Type === 'Series');
    for (const series of seriesItems) {
      const episodes = await jellyfin.getAllEpisodesForSeries(series.Id);
      if (episodes.length > 0) {
        const episodeRecords = episodes.map(ep => {
          const stillPath = ep.ImageTags?.Primary ? `Items/${ep.Id}/Images/Primary?tag=${ep.ImageTags.Primary}` : null;
          return {
            series_jellyfin_id: series.Id,
            episode_jellyfin_id: ep.Id,
            season_number: ep.ParentIndexNumber,
            episode_number: ep.IndexNumber,
            title: ep.Name ?? null,
            still_path: stillPath,
            tvdb_id: ep.ProviderIds?.Tvdb ? parseInt(ep.ProviderIds.Tvdb, 10) : null,
            tmdb_id: ep.ProviderIds?.Tmdb ? parseInt(ep.ProviderIds.Tmdb, 10) : null,
          };
        });
        
        const { error: episodeUpsertError } = await supabaseAdmin
          .from('jellyfin_episodes')
          .upsert(episodeRecords, { onConflict: 'episode_jellyfin_id' });

        if (episodeUpsertError) {
          console.error(`Failed to upsert episodes for series ${series.Id}: ${episodeUpsertError.message}`);
        }
      }
    }

    const newStartIndex = startIndex + (pageData.Items?.length || 0);
    const isViewDone = newStartIndex >= (pageData.TotalRecordCount || 0);

    return new Response(JSON.stringify({
      ok: true,
      itemsProcessed: catalogItems.length,
      nextStartIndex: isViewDone ? 0 : newStartIndex,
      isViewDone: isViewDone,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Unhandled error in sync-jellyfin function:', error);
    return new Response(JSON.stringify({ ok: false, error: error?.message || String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
})