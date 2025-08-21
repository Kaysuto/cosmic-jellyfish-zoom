/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const JELLYFIN_BASE_URL = Deno.env.get("JELLYFIN_BASE_URL");
const JELLYFIN_API_KEY = Deno.env.get("JELLYFIN_API_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!JELLYFIN_BASE_URL || !JELLYFIN_API_KEY) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: "JELLYFIN_BASE_URL or JELLYFIN_API_KEY is not set in the function's secrets." 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  try {
    const url = `${JELLYFIN_BASE_URL}/System/Info?api_key=${JELLYFIN_API_KEY}`;
    const response = await fetch(url, { method: 'GET' });

    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Connection successful!",
        serverName: data.ServerName,
        version: data.Version,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: `Failed to connect to Jellyfin. The server responded with status: ${response.status} ${response.statusText}.`,
        details: "Please check if your JELLYFIN_BASE_URL is correct and publicly accessible, and if your JELLYFIN_API_KEY is valid."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  } catch (error) {
    // This catch block will handle network errors, like DNS resolution failure or timeouts
    return new Response(JSON.stringify({ 
      success: false, 
      message: "A network error occurred while trying to reach the Jellyfin server.",
      details: `Error: ${error.message}. This often means the JELLYFIN_BASE_URL ('${JELLYFIN_BASE_URL}') is incorrect or not reachable from the internet.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})