/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
// @ts-nocheck

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { corsHeaders } from '../_shared/cors.ts'

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_API_URL = 'https://api.themoviedb.org/3';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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