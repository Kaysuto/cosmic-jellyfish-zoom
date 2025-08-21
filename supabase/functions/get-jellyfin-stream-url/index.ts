// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JELLYFIN_BASE_URL = Deno.env.get("JELLYFIN_BASE_URL");
const JELLYFIN_API_KEY = Deno.env.get("JELLYFIN_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jellyfinId } = await req.json();
    if (!jellyfinId) {
      throw new Error("jellyfinId is required");
    }

    // 1. Get Item details to check if it's a Movie or Series
    const itemInfoUrl = `${JELLYFIN_BASE_URL}/Items/${jellyfinId}?api_key=${JELLYFIN_API_KEY}`;
    const itemInfoRes = await fetch(itemInfoUrl);
    if (!itemInfoRes.ok) {
      throw new Error(`Jellyfin Item Info API error: ${itemInfoRes.status} ${itemInfoRes.statusText}`);
    }
    const itemInfo = await itemInfoRes.json();

    let playableItemId = jellyfinId;

    // 2. If it's a Series, find the first episode
    if (itemInfo.Type === 'Series') {
      const episodesUrl = `${JELLYFIN_BASE_URL}/Items?ParentId=${jellyfinId}&IncludeItemTypes=Episode&Recursive=true&SortBy=SortName&Limit=1&api_key=${JELLYFIN_API_KEY}`;
      const episodesRes = await fetch(episodesUrl);
      if (!episodesRes.ok) {
        throw new Error(`Jellyfin Episodes API error: ${episodesRes.status} ${episodesRes.statusText}`);
      }
      const episodesData = await episodesRes.json();
      
      if (episodesData.Items && episodesData.Items.length > 0) {
        playableItemId = episodesData.Items[0].Id;
      } else {
        throw new Error("This series has no episodes available on Jellyfin.");
      }
    }

    // 3. Directly construct the stream URL without calling PlaybackInfo
    const streamUrl = `${JELLYFIN_BASE_URL}/Videos/${playableItemId}/stream?api_key=${JELLYFIN_API_KEY}`;

    return new Response(JSON.stringify({ url: streamUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in get-jellyfin-stream-url function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});