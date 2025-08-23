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
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  if (!TMDB_API_KEY) {
    return new Response(JSON.stringify({ error: 'TMDB API key is not configured.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const { mediaType, language, page, sortBy, genres, studios, networks, keywords } = await req.json();
    if (!mediaType) {
      throw new Error("mediaType is required (movie, tv, or anime)");
    }

    let discoverUrl;
    let type = mediaType;
    let params = `api_key=${TMDB_API_KEY}&language=${language || 'en-US'}&page=${page || 1}&sort_by=${sortBy || 'popularity.desc'}`;
    
    if (genres) {
      params += `&with_genres=${genres}`;
    }
    if (keywords) {
      params += `&with_keywords=${keywords}`;
    }

    if (studios && mediaType === 'movie') {
      params += `&with_companies=${studios}`;
    }
    if (networks && (mediaType === 'tv' || mediaType === 'anime')) {
      params += `&with_networks=${networks}`;
    }

    if (mediaType === 'anime') {
      type = 'tv';
      // Pour les animés, on ajoute le genre "Animation" (16) et le pays d'origine Japon (JP)
      const animeGenres = genres ? `16,${genres}` : '16';
      discoverUrl = `${TMDB_API_URL}/discover/tv?${params}&with_genres=${animeGenres}&with_origin_country=JP`;
    } else {
      discoverUrl = `${TMDB_API_URL}/discover/${mediaType}?${params}`;
    }
    
    const response = await fetch(discoverUrl);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    const data = await response.json();

    const resultsWithMediaType = data.results.map(item => ({
        ...item,
        media_type: type
    }));

    return new Response(JSON.stringify({
        page: data.page,
        results: resultsWithMediaType,
        total_pages: data.total_pages,
        total_results: data.total_results
    }), {
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