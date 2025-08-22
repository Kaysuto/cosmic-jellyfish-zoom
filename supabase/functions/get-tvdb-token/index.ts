/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TVDB_API_URL = 'https://api4.thetvdb.com/v4';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('THETVDB_API_KEY');
    if (!apiKey) {
      throw new Error('TheTVDB API key is not configured on the server.');
    }

    const response = await fetch(`${TVDB_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        apikey: apiKey,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`TheTVDB authentication failed: ${errorBody.message || response.statusText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({ token: data.data.token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-tvdb-token function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})