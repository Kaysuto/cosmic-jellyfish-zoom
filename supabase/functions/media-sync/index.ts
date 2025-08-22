// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchJellyfinItemsByPage(JELLYFIN_BASE_URL, JELLYFIN_API_KEY, startIndex = 0, limit = 200) {
  let items = [];
  let totalRecordCount = 0;
  try {
    const url = `${JELLYFIN_BASE_URL}/Items?Recursive=true&IncludeItemTypes=Movie,Series&Fields=PrimaryImageAspectRatio,Genres,Overview,SeriesInfo,ProviderIds&api_key=${JELLYFIN_API_KEY}&StartIndex=${startIndex}&Limit=${limit}`;
    const r = await fetch(url);
    if (r.ok) {
      const j = await r.json();
      if (j?.Items) items = j.Items;
      totalRecordCount = j.TotalRecordCount || 0;
    } else {
      throw new Error(`Jellyfin API error: ${r.status} ${r.statusText}`);
    }
  } catch (e) {
    console.error("Error fetching from Jellyfin:", e.message);
    throw e;
  }

  const normalizedItems = [];
  for (const it of items) {
    const tmdbIdStr = it.ProviderIds?.Tmdb;
    const tmdbIdInt = tmdbIdStr ? parseInt(tmdbIdStr, 10) : null;
    
    let playableItemId = it.Id;
    let itemType = it.Type;

    if (itemType === 'Series') {
      try {
        const episodesUrl = `${JELLYFIN_BASE_URL}/Items?ParentId=${it.Id}&IncludeItemTypes=Episode&Recursive=true&SortBy=SortName&Limit=1&api_key=${JELLYFIN_API_KEY}`;
        const episodesRes = await fetch(episodesUrl);
        if (episodesRes.ok) {
          const episodesData = await episodesRes.json();
          if (episodesData.Items && episodesData.Items.length > 0) {
            playableItemId = episodesData.Items[0].Id;
          } else {
            playableItemId = null;
          }
        } else {
           playableItemId = null;
        }
      } catch (e) {
        console.error(`Error fetching episodes for series ${it.Id}:`, e.message);
        playableItemId = null;
      }
    }

    normalizedItems.push({
      jellyfin_id: it.Id || it.id,
      name: it.Name || it.name,
      type: itemType || it.type,
      year: it.ProductionYear || null,
      overview: it.Overview || null,
      genres: (it.Genres || []).join(","),
      duration: it.RunTimeTicks || null,
      parent_id: it.SeriesId || it.ParentId || null,
      tmdb_id: !isNaN(tmdbIdInt) ? tmdbIdInt : null,
      thumbnail: it?.ImageTags?.Primary ? `${JELLYFIN_BASE_URL}/Items/${it.Id}/Images/Primary?api_key=${JELLYFIN_API_KEY}` : null,
      direct_stream_url: playableItemId ? `${JELLYFIN_BASE_URL}/hls/${playableItemId}/main.m3u8?api_key=${JELLYFIN_API_KEY}` : null,
      raw: it,
    });
  }
  
  return { items: normalizedItems, total: totalRecordCount };
}

async function upsertBatchToSupabase(supabaseAdmin, items) {
  if (!items || items.length === 0) return 0;

  const recordsToUpsert = items.map((it) => ({
    jellyfin_id: it.jellyfin_id,
    title: it.name,
    media_type: it.type?.toLowerCase(),
    production_year: it.year,
    overview: it.overview,
    genres: it.genres,
    duration: it.duration,
    thumbnail: it.thumbnail,
    direct_stream_url: it.direct_stream_url,
    raw: it.raw,
    available: true,
    tmdb_id: it.tmdb_id,
  }));

  const { error } = await supabaseAdmin
    .from('media')
    .upsert(recordsToUpsert, { onConflict: 'jellyfin_id' });

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }
  return items.length;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('jellyfin_settings')
      .select('url, api_key')
      .eq('id', 1)
      .single();

    if (settingsError || !settings || !settings.url || !settings.api_key) {
      throw new Error("Jellyfin URL and API Key are not configured in the admin settings.");
    }
    
    const JELLYFIN_BASE_URL = settings.url;
    const JELLYFIN_API_KEY = settings.api_key;

    const body = await req.json().catch(() => ({}));
    const { _path, startIndex = 0, limit = 50 } = body;

    if (_path === '/sync') {
      let totalUpserted = 0;
      let currentStartIndex = 0;
      const batchLimit = 200;
      let hasMore = true;

      while (hasMore) {
        const { items, total } = await fetchJellyfinItemsByPage(JELLYFIN_BASE_URL, JELLYFIN_API_KEY, currentStartIndex, batchLimit);
        if (items.length > 0) {
          const upsertedCount = await upsertBatchToSupabase(supabaseAdmin, items);
          totalUpserted += upsertedCount;
        }
        currentStartIndex += items.length;
        if (items.length < batchLimit || (total > 0 && currentStartIndex >= total)) {
          hasMore = false;
        }
      }
      return new Response(JSON.stringify({ success: true, upserted: totalUpserted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const log = { request: { startIndex, limit }, fetch: {}, upsert: {} };
    let fetchedItems;
    try {
      const { items, total } = await fetchJellyfinItemsByPage(JELLYFIN_BASE_URL, JELLYFIN_API_KEY, startIndex, limit);
      fetchedItems = items;
      log.fetch = { status: 'success', count: items.length, totalServerItems: total, firstItemName: items.length > 0 ? items[0].name : 'N/A' };
    } catch (e) {
      log.fetch = { status: 'error', message: e.message };
      return new Response(JSON.stringify({ log }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    try {
      const upsertedCount = await upsertBatchToSupabase(supabaseAdmin, fetchedItems);
      log.upsert = { status: 'success', count: upsertedCount };
    } catch (e) {
      log.upsert = { status: 'error', message: e.message, itemsSent: fetchedItems.map(i => ({ name: i.name, tmdb_id: i.tmdb_id, jellyfin_id: i.jellyfin_id })) };
    }
    return new Response(JSON.stringify({ log }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in media-sync function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});