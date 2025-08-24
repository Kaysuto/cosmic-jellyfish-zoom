/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// Simple in-memory cache
const genreCache = new Map();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  if (!TMDB_API_KEY) {
    return new Response(JSON.stringify({ error: 'TMDB API key is not configured.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const { mediaType, language } = await req.json();
    if (!mediaType) {
      throw new Error("mediaType is required (movie or tv)");
    }

    const cacheKey = `${mediaType}-${language || 'en-US'}`;
    if (genreCache.has(cacheKey)) {
      return new Response(JSON.stringify(genreCache.get(cacheKey)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const url = `${TMDB_API_URL}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}&language=${language || 'en-US'}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    const data = await response.json();

    // Store in cache before returning
    genreCache.set(cacheKey, data.genres);

    return new Response(JSON.stringify(data.genres), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})