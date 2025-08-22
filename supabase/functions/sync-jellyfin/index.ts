/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

class JellyfinClient {
  private baseUrl: string;
  private apiKey: string;
  private userId?: string;
  private accessToken?: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.apiKey = apiKey;
  }

  async authenticate() {
    const authResponse = await fetch(`${this.baseUrl}/Users/AuthenticateWithKey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Authorization': `MediaBrowser ApiKey="${this.apiKey}"`,
      },
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text().catch(() => authResponse.statusText);
      throw new Error(`Jellyfin authentication failed: ${authResponse.status} ${errorText}`);
    }
    
    const authData = await authResponse.json();
    this.accessToken = authData.AccessToken;
    this.userId = authData.User.Id;
  }

  private async getAuthHeaders() {
    if (!this.accessToken) throw new Error('Not authenticated. Call authenticate() first.');
    return {
      'Content-Type': 'application/json',
      'X-Emby-Authorization': `MediaBrowser ApiKey="${this.apiKey}", Token="${this.accessToken}"`,
    };
  }

  async getViews() {
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
      // Return structured response so client can surface the cause without a raw 500
      const message = `Failed to fetch Jellyfin settings: ${settingsError.message || settingsError}`;
      console.error(message);
      return new Response(JSON.stringify({ ok: false, error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
    if (!settings || !settings.url || !settings.api_key) {
      const message = 'Jellyfin URL or API key is not configured in settings.';
      console.error(message);
      return new Response(JSON.stringify({ ok: false, error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const jellyfin = new JellyfinClient(settings.url, settings.api_key);

    try {
      await jellyfin.authenticate();
    } catch (authErr) {
      console.error('Jellyfin auth error:', authErr.message || authErr);
      return new Response(JSON.stringify({ ok: false, error: `Jellyfin authentication failed: ${authErr.message || authErr}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const reqBody = await req.json().catch(() => ({}));
    const viewId = reqBody.viewId;
    const startIndex = Number(reqBody.startIndex || 0);
    const limit = 200;

    // If no viewId provided, return the list of views (libraries)
    if (!viewId) {
      try {
        const viewsData = await jellyfin.getViews();
        const views = (viewsData.Items || []).map((v: any) => ({
          id: v.Id,
          name: v.Name,
          totalItems: v.TotalRecordCount || 0,
        }));
        return new Response(JSON.stringify({ ok: true, views }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      } catch (viewsErr) {
        console.error('Error fetching views:', viewsErr.message || viewsErr);
        return new Response(JSON.stringify({ ok: false, error: `Error fetching views: ${viewsErr.message || viewsErr}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
    }

    // Otherwise, process a single page for the provided viewId/startIndex
    let pageData;
    try {
      pageData = await jellyfin.getLibraryItemsPage(viewId, startIndex, limit);
    } catch (pageErr) {
      console.error('Error fetching library page:', pageErr.message || pageErr);
      return new Response(JSON.stringify({ ok: false, error: `Error fetching library page: ${pageErr.message || pageErr}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    if (!pageData || !pageData.Items || pageData.Items.length === 0) {
      return new Response(JSON.stringify({ ok: true, itemsProcessed: 0, isViewDone: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const excludedName = "kaï";
    const filteredItems = (pageData.Items || []).filter((item: any) => !(item.Name && item.Name.toLowerCase().includes(excludedName)));

    const catalogItems = filteredItems.map((item: any) => {
      const releaseDate = item.PremiereDate ? new Date(item.PremiereDate).toISOString().split('T')[0] : null;
      const posterPath = item.ImageTags?.Primary ? `/Items/${item.Id}/Images/Primary?tag=${item.ImageTags.Primary}` : null;
      const backdropPath = item.ImageTags?.Backdrop ? `/Items/${item.Id}/Images/Backdrop?tag=${item.ImageTags.Backdrop}` : null;

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
      try {
        const { error: upsertError } = await supabaseAdmin
          .from('catalog_items')
          .upsert(catalogItems, { onConflict: 'jellyfin_id' });

        if (upsertError) {
          console.error('Supabase upsert error:', upsertError);
          return new Response(JSON.stringify({ ok: false, error: `Failed to save items: ${upsertError.message || upsertError}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
        }
      } catch (dbErr) {
        console.error('Unexpected DB error:', dbErr);
        return new Response(JSON.stringify({ ok: false, error: `Unexpected DB error: ${dbErr.message || dbErr}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
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
    // Always return a 200 with ok:false so the client receives the structured error
    return new Response(JSON.stringify({ ok: false, error: error?.message || String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
})