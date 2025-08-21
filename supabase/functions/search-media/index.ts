/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_API_URL = 'https://api.themoviedb.org/3';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY environment variable not set.');
    return new Response(JSON.stringify({ error: 'TMDB API key is not configured on the server.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const { query, mediaType, language } = await req.json();
    if (!query || !mediaType) {
      throw new Error("query and mediaType are required");
    }

    const searchUrl = `${TMDB_API_URL}/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=${language || 'en-US'}`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`TMDB API error: ${response.statusText}`, errorBody);
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    const data = await response.json();

    return new Response(JSON.stringify(data.results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in search-media function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})