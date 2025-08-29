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
    const { mediaType, limit = 10, language = 'fr-FR' } = await req.json();
    
    console.log(`[DEBUG] Requested mediaType: ${mediaType}, limit: ${limit}`);
    
    let url;
    let results = [];

    if (mediaType === 'anime') {
      // Utiliser la même logique que discover-media pour les animés
      url = `${TMDB_API_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=${language}&sort_by=popularity.desc&with_genres=16&with_origin_country=JP&include_adult=false&include_video=false&page=1`;
      console.log(`[DEBUG] Anime URL: ${url}`);
    } else if (mediaType === 'movie') {
      url = `${TMDB_API_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=${language}&page=1`;
      console.log(`[DEBUG] Movie URL: ${url}`);
    } else if (mediaType === 'tv') {
      url = `${TMDB_API_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=${language}&page=1`;
      console.log(`[DEBUG] TV URL: ${url}`);
    } else {
      // Fallback: trending all
      url = `${TMDB_API_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=${language}`;
      console.log(`[DEBUG] Fallback URL: ${url}`);
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    const data = await response.json();

    console.log(`[DEBUG] Raw results count: ${data.results?.length || 0}`);

    if (mediaType === 'anime') {
      // Filtrer pour s'assurer qu'on a bien des animés (même logique que discover-media)
      results = data.results.filter(item => 
        item.origin_country && 
        item.origin_country.includes('JP') && 
        item.genre_ids && 
        item.genre_ids.includes(16) // Animation genre
      );
      // S'assurer que tous les animés ont le bon media_type
      results = results.map(item => ({ ...item, media_type: 'tv' }));
      console.log(`[DEBUG] Filtered anime results: ${results.length}`);
    } else if (mediaType === 'movie') {
      results = data.results;
      // S'assurer que tous les films ont le bon media_type
      results = results.map(item => ({ ...item, media_type: 'movie' }));
      console.log(`[DEBUG] Movie results: ${results.length}`);
    } else if (mediaType === 'tv') {
      results = data.results;
      // S'assurer que toutes les séries ont le bon media_type
      results = results.map(item => ({ ...item, media_type: 'tv' }));
      console.log(`[DEBUG] TV results: ${results.length}`);
    } else {
      // Pour le fallback, filtrer les personnes
      results = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
      console.log(`[DEBUG] Fallback results: ${results.length}`);
    }

    // Limiter le nombre de résultats
    if (limit && results.length > limit) {
      results = results.slice(0, limit);
    }

    console.log(`[DEBUG] Final results count: ${results.length}`);
    console.log(`[DEBUG] Sample result:`, results[0] ? { id: results[0].id, title: results[0].title, media_type: results[0].media_type } : 'No results');

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`[DEBUG] Error:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})