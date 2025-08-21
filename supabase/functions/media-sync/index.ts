/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

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

  if (!JELLYFIN_BASE_URL || !JELLYFIN_API_KEY) {
    return new Response(JSON.stringify({ error: "Jellyfin environment variables are not set in function secrets." }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }

  try {
    // We try to fetch only ONE item to test the /Items endpoint specifically.
    const url = `${JELLYFIN_BASE_URL}/Items?Recursive=true&IncludeItemTypes=Movie,Series&Fields=ProviderIds&Limit=1&api_key=${JELLYFIN_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jellyfin API error for /Items endpoint: ${response.status} ${response.statusText}. Body: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Instead of processing, we return the raw data for debugging.
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in media-sync (debug mode):", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});