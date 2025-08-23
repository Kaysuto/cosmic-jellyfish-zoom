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
    const { mediaType, language } = await req.json();
    if (!mediaType) {
      throw new Error("mediaType is required (movie or tv)");
    }

    const url = `${TMDB_API_URL}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}&language=${language || 'en-US'}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    const data = await response.json();

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