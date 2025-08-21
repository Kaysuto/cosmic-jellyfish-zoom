/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_API_URL = 'https://api.themoviedb.org/3';

const customAnimeKeywords = [
  { id: 193236, name: 'Isekai', type: 'keyword' },
  { id: 1994, name: 'Mecha', type: 'keyword' },
  { id: 193222, name: 'Magical Girl', type: 'keyword' },
  { id: 28751, name: 'Slice of Life', type: 'keyword' },
  { id: 226243, name: 'Shounen', type: 'keyword' },
  { id: 226244, name: 'Shoujo', type: 'keyword' },
  { id: 226245, name: 'Seinen', type: 'keyword' },
  { id: 226246, name: 'Josei', type: 'keyword' },
  { id: 2410, name: 'Sports', type: 'keyword' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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

    const apiMediaType = mediaType === 'anime' ? 'tv' : mediaType;
    const url = `${TMDB_API_URL}/genre/${apiMediaType}/list?api_key=${TMDB_API_KEY}&language=${language || 'en-US'}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    const data = await response.json();
    const standardGenres = data.genres.map(g => ({ ...g, type: 'genre' }));

    if (mediaType === 'anime') {
      const combined = [...customAnimeKeywords, ...standardGenres];
      // Remove duplicates by name, preferring custom keywords
      const unique = Array.from(new Map(combined.map(item => [item.name, item])).values());
      return new Response(JSON.stringify(unique), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify(standardGenres), {
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