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

    // 1. Get Playback Info from Jellyfin
    const playbackInfoUrl = `${JELLYFIN_BASE_URL}/Items/${jellyfinId}/PlaybackInfo?api_key=${JELLYFIN_API_KEY}`;
    const playbackInfoRes = await fetch(playbackInfoUrl, { method: 'POST', body: '{}', headers: {'Content-Type': 'application/json'} });
    
    if (!playbackInfoRes.ok) {
      throw new Error(`Jellyfin PlaybackInfo API error: ${playbackInfoRes.status} ${playbackInfoRes.statusText}`);
    }
    const playbackInfo = await playbackInfoRes.json();

    // 2. Find the HLS stream source
    const hlsSource = playbackInfo.MediaSources.find(s => s.SupportsStreaming && (s.Container === 'm3u8' || s.Path.includes('.m3u8')));

    let streamUrl;
    if (hlsSource && hlsSource.Path) {
      // Construct the full HLS URL
      if (hlsSource.Path.startsWith('http')) {
         streamUrl = hlsSource.Path;
      } else {
         streamUrl = `${JELLYFIN_BASE_URL}${hlsSource.Path.startsWith('/') ? '' : '/'}${hlsSource.Path}`;
      }
    } else {
      // Fallback to the direct stream URL if no HLS is found
      streamUrl = `${JELLYFIN_BASE_URL}/Videos/${jellyfinId}/stream?api_key=${JELLYFIN_API_KEY}`;
    }

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