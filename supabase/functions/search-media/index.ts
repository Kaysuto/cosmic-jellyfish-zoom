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
    return new Response(JSON.stringify({ error: 'TMDB API key is not configured on the server.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const { query, mediaType, language } = await req.json();
    if (!query) {
      throw new Error("query is required");
    }

    const searchEndpoint = mediaType || 'multi';
    const searchUrl = `${TMDB_API_URL}/search/${searchEndpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=${language || 'en-US'}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}. Body: ${errorBody}`);
    }
    
    let data = await response.json();

    // Filter out results that are not movies or TV shows, directly in the function
    const filteredResults = data.results.filter(item => 
      item.media_type === 'movie' || item.media_type === 'tv'
    );

    return new Response(JSON.stringify(filteredResults), {
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