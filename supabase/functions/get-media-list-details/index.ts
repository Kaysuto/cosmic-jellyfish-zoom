/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
// @ts-nocheck

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_API_URL = 'https://api.themoviedb.org/3';

serve(async (req) => {
  // Ensure OPTIONS preflight returns an empty 204 with CORS headers immediately
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { mediaList, language } = await req.json(); // mediaList: [{ media_id, media_type }]
    if (!Array.isArray(mediaList)) {
      throw new Error("mediaList is required and must be an array.");
    }

    const promises = mediaList.map(item => {
      const url = `${TMDB_API_URL}/${item.media_type}/${item.media_id}?api_key=${TMDB_API_KEY}&language=${language || 'en-US'}`;
      return fetch(url).then(res => res.json());
    });

    const results = await Promise.all(promises);

    return new Response(JSON.stringify(results), {
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