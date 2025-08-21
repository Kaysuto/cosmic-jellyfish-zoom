// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jellyfinId } = await req.json();
    if (!jellyfinId) {
      throw new Error("jellyfinId is required");
    }

    // --- START OF TEST CODE ---
    // All Jellyfin logic is temporarily disabled for debugging.
    const dummyUrl = `https://example.com/stream/${jellyfinId}`;
    // --- END OF TEST CODE ---

    return new Response(JSON.stringify({ url: dummyUrl }), {
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