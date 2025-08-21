/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JELLYFIN_BASE_URL = Deno.env.get("JELLYFIN_BASE_URL");
const JELLYFIN_API_KEY = Deno.env.get("JELLYFIN_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!JELLYFIN_BASE_URL || !JELLYFIN_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("One or more required env vars are missing for media-sync function.");
}

async function fetchJellyfinItems() {
  let items = [];
  try {
    const url = `${JELLYFIN_BASE_URL}/Items?Recursive=true&IncludeItemTypes=Movie,Series&Fields=PrimaryImageAspectRatio,Genres,Overview,SeriesInfo,ProviderIds&api_key=${JELLYFIN_API_KEY}`;
    const r = await fetch(url);
    if (r.ok) {
      const j = await r.json();
      if (j?.Items) items = j.Items;
    }
  } catch (e) {
    console.error("Error fetching from Jellyfin:", e.message);
  }

  const normalized = items.map((it) => {
    return {
      jellyfin_id: it.Id || it.id,
      name: it.Name || it.name,
      type: it.Type || it.type,
      year: it.ProductionYear || null,
      overview: it.Overview || null,
      genres: (it.Genres || []).join(","),
      duration: it.RunTimeTicks || null,
      parent_id: it.SeriesId || it.ParentId || null,
      tmdb_id: it.ProviderIds?.Tmdb || null,
      thumbnail: it?.ImageTags?.Primary ? `${JELLYFIN_BASE_URL}/Items/${it.Id}/Images/Primary?api_key=${JELLYFIN_API_KEY}` : null,
      direct_stream_url: `${JELLYFIN_BASE_URL}/Videos/${it.Id}/stream?api_key=${JELLYFIN_API_KEY}`,
      raw: it,
    };
  });

  return normalized;
}

async function upsertToSupabase(items) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase config missing");
  }

  const url = `${SUPABASE_URL}/rest/v1/media`;
  const res = await fetch(url + "?on_conflict=jellyfin_id", {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(
      items.map((it) => ({
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
      }))
    ),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase upsert failed: ${res.status} ${txt}`);
  }

  return await res.json();
}

async function buildStreamUrl(jellyfinId) {
  if (!JELLYFIN_BASE_URL || !JELLYFIN_API_KEY) {
    throw new Error("Jellyfin config missing");
  }
  return `${JELLYFIN_BASE_URL}/Videos/${jellyfinId}/stream?api_key=${JELLYFIN_API_KEY}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    if (req.method === "POST" && pathname.endsWith("/sync")) {
      const items = await fetchJellyfinItems();
      const result = await upsertToSupabase(items);
      return new Response(JSON.stringify({ success: true, upserted: Array.isArray(result) ? result.length : 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (req.method === "POST" && (pathname.endsWith("/stream-url") || pathname.endsWith("/media-sync"))) {
      const body = await req.json();
      const jellyfinId = body?.jellyfinId;
      if (!jellyfinId) {
        throw new Error("jellyfinId is required");
      }
      const streamUrl = await buildStreamUrl(jellyfinId);
      return new Response(JSON.stringify({ url: streamUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(
      JSON.stringify({ message: "media-sync function. POST /sync to sync, POST /stream-url { jellyfinId } for URL." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});