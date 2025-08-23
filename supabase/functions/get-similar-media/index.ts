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
    const { mediaType, mediaId, language } = await req.json();
    if (!mediaType || !mediaId) {
      throw new Error("mediaType and mediaId are required");
    }

    const url = `${TMDB_API_URL}/${mediaType}/${mediaId}/similar?api_key=${TMDB_API_KEY}&language=${language || 'en-US'}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    const data = await response.json();

    const resultsWithMediaType = data.results.map((item: any) => ({
        ...item,
        media_type: mediaType 
    }));

    // Sort by release date (descending)
    resultsWithMediaType.sort((a: any, b: any) => {
      const dateA = new Date(a.release_date || a.first_air_date);
      const dateB = new Date(b.release_date || b.first_air_date);
      if (isNaN(dateB.getTime())) return -1;
      if (isNaN(dateA.getTime())) return 1;
      return dateB.getTime() - dateA.getTime();
    });

    return new Response(JSON.stringify(resultsWithMediaType), {
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