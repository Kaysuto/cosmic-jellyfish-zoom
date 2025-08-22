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
    return new Response(JSON.stringify({ error: 'TMDB API key is not configured.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const { mediaType, language, startDate, endDate } = await req.json();
    if (!mediaType || !startDate || !endDate) {
      throw new Error("mediaType, startDate, and endDate are required");
    }

    let allResults = [];
    let page = 1;
    let totalPages = 1;

    const baseParams = `api_key=${TMDB_API_KEY}&language=${language || 'en-US'}&air_date.gte=${startDate}&air_date.lte=${endDate}`;
    
    let discoverUrl;
    if (mediaType === 'anime') {
      discoverUrl = `${TMDB_API_URL}/discover/tv?${baseParams}&with_genres=16&with_origin_country=JP`;
    } else { // 'tv'
      discoverUrl = `${TMDB_API_URL}/discover/tv?${baseParams}`;
    }

    // TMDB API has a limit of 500 pages, but for a weekly schedule, we'll likely need far fewer.
    // We'll loop to get all results within the week.
    do {
      const response = await fetch(`${discoverUrl}&page=${page}`);
      if (!response.ok) {
        const errorBody = await response.json();
        console.error('TMDB API Error:', errorBody);
        throw new Error(`TMDB API error: ${response.statusText}`);
      }
      const data = await response.json();
      
      const resultsWithMediaType = data.results.map(item => ({
          ...item,
          media_type: mediaType === 'anime' ? 'tv' : mediaType, // TMDB type is 'tv' for anime
      }));

      allResults = allResults.concat(resultsWithMediaType);
      totalPages = data.total_pages;
      page++;
    } while (page <= totalPages && page < 50); // Increased safety break to 50 pages

    return new Response(JSON.stringify(allResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-airing-schedule function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})