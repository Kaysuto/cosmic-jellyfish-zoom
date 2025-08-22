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
  useDirectToken = false; // when true, treat apiKey as token

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.apiKey = apiKey;
  }

  async authenticate() {
    // Primary method: AuthenticateWithKey (returns AccessToken)
    const authResponse = await fetch(`${this.baseUrl}/Users/AuthenticateWithKey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Authorization': `MediaBrowser ApiKey="${this.apiKey}"`,
      },
    });

    if (!authResponse.ok) {
      const body = await authResponse.text().catch(() => authResponse.statusText);
      const err: any = new Error('AuthenticateWithKey failed');
      err.status = authResponse.status;
      err.body = body;
      throw err;
    }

    const authData = await authResponse.json();
    this.accessToken = authData.AccessToken;
    this.userId = authData.User.Id;
  }

  // Fallback test: try using the API key directly as X-Emby-Token header
  async testDirectToken() {
    const url = `${this.baseUrl}/Users`;
    const resp = await fetch(url, {
      headers: {
        'X-Emby-Token': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
    return resp;
  }

  private async getAuthHeaders() {
    if (this.useDirectToken) {
      return {
        'Content-Type': 'application/json',
        'X-Emby-Token': this.apiKey,
      };
    }
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

  // We'll build a diagnostic object to return in case of auth failures
  const diagnostics: any[] = [];

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
      console.error(message);
      return new Response(JSON.stringify({ ok: false, error: message, diagnostics }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
    if (!settings || !settings.url || !settings.api_key) {
      const message = 'Jellyfin URL or API key is not configured in settings.';
      console.error(message);
      return new Response(JSON.stringify({ ok: false, error: message, diagnostics }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }

    const jellyfin = new JellyfinClient(settings.url, settings.api_key);

    // 1) Try AuthenticateWithKey
    try {
      await jellyfin.authenticate();
      diagnostics.push({ method: 'AuthenticateWithKey', ok: true });
    } catch (authErr: any) {
      diagnostics.push({
        method: 'AuthenticateWithKey',
        ok: false,
        status: authErr.status || 'unknown',
        body: authErr.body || String(authErr.message || authErr)
      });

      // 2) Fallback: test using the API key as X-Emby-Token directly
      try {
        const resp = await jellyfin.testDirectToken();
        const bodyText = await resp.text().catch(() => '');
        diagnostics.push({
          method: 'X-Emby-Token test (GET /Users)',
          ok: resp.ok,
          status: resp.status,
          body: bodyText
        });

        if (resp.ok) {
          // This instance accepts the API key as a token in X-Emby-Token header.
          jellyfin.useDirectToken = true;
          // Try to get a user id by listing users (if returns JSON)
          try {
            const usersResp = await fetch(`${jellyfin.baseUrl}/Users`, {
              headers: { 'X-Emby-Token': settings.api_key, 'Content-Type': 'application/json' },
            });
            if (usersResp.ok) {
              const usersJson = await usersResp.json().catch(() => null);
              if (Array.isArray(usersJson) && usersJson.length > 0) {
                jellyfin.userId = usersJson[0].Id; // best-effort
                diagnostics.push({ method: 'Extracted userId from /Users', userId: jellyfin.userId });
              }
            }
          } catch (uErr) {
            diagnostics.push({ method: 'Users fetch after direct token', ok: false, error: String(uErr.message || uErr) });
          }
        } else {
          // both methods failed -> return diagnostics
          const message = 'Jellyfin authentication failed for both AuthenticateWithKey and X-Emby-Token methods.';
          console.error(message, diagnostics);
          return new Response(JSON.stringify({ ok: false, error: message, diagnostics }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
        }
      } catch (directErr) {
        diagnostics.push({ method: 'X-Emby-Token test', ok: false, error: String(directErr.message || directErr) });
        const message = 'Jellyfin authentication failed for both AuthenticateWithKey and X-Emby-Token methods.';
        console.error(message, diagnostics);
        return new Response(JSON.stringify({ ok: false, error: message, diagnostics }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
    }

    // Proceed with client-orchestrated paging sync
    const reqBody = await req.json().catch(() => ({}));
    const viewId = reqBody.viewId;
    const startIndex = Number(reqBody.startIndex || 0);
    const limit = 200;

    if (!viewId) {
      // Return views for the client to orchestrate paging
      try {
        const viewsData = await jellyfin.getViews();
        const views = (viewsData.Items || []).map((v: any) => ({
          id: v.Id,
          name: v.Name,
          totalItems: v.TotalRecordCount || 0,
        }));
        return new Response(JSON.stringify({ ok: true, views }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } catch (viewsErr) {
        console.error('Error fetching views after auth:', viewsErr);
        diagnostics.push({ method: 'getViews after auth', ok: false, error: String(viewsErr.message || viewsErr) });
        return new Response(JSON.stringify({ ok: false, error: 'Failed to list views after successful auth.', diagnostics }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
    }

    // Fetch single page for given viewId/startIndex
    let pageData;
    try {
      pageData = await jellyfin.getLibraryItemsPage(viewId, startIndex, limit);
    } catch (pageErr) {
      console.error('Error fetching library page:', pageErr);
      diagnostics.push({ method: 'getLibraryItemsPage', ok: false, error: String(pageErr.message || pageErr) });
      return new Response(JSON.stringify({ ok: false, error: `Error fetching library page: ${pageErr.message || pageErr}`, diagnostics }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
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
          diagnostics.push({ method: 'upsert catalog_items', ok: false, error: String(upsertError.message || upsertError) });
          return new Response(JSON.stringify({ ok: false, error: `Failed to save items: ${upsertError.message || upsertError}`, diagnostics }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
        }
      } catch (dbErr) {
        console.error('Unexpected DB error:', dbErr);
        diagnostics.push({ method: 'upsert exception', ok: false, error: String(dbErr.message || dbErr) });
        return new Response(JSON.stringify({ ok: false, error: `Unexpected DB error: ${dbErr.message || dbErr}`, diagnostics }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
    }

    const newStartIndex = startIndex + (pageData.Items?.length || 0);
    const isViewDone = newStartIndex >= (pageData.TotalRecordCount || 0);

    return new Response(JSON.stringify({
      ok: true,
      itemsProcessed: catalogItems.length,
      nextStartIndex: isViewDone ? 0 : newStartIndex,
      isViewDone: isViewDone,
      diagnostics,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Unhandled error in sync-jellyfin function:', error);
    // Always return structured response
    return new Response(JSON.stringify({ ok: false, error: error?.message || String(error), diagnostics: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
})