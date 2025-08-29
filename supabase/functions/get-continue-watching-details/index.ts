/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
// @ts-nocheck

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { userId, language } = await req.json();
    if (!userId) {
      throw new Error("userId is required.");
    }

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get continue watching items from database
    const { data: continueWatchingData, error: dbError } = await supabaseAdmin.rpc('get_continue_watching', { p_user_id: userId });
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (!continueWatchingData || continueWatchingData.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get TMDB details for each item
    const promises = continueWatchingData.map(item => {
      const url = `${TMDB_API_URL}/${item.media_type}/${item.id}?api_key=${TMDB_API_KEY}&language=${language || 'en-US'}`;
      return fetch(url).then(res => res.json()).then(tmdbData => ({
        ...item,
        ...tmdbData,
        // Keep the progress and playback data from our database
        progress: item.progress,
        playback_position_ticks: item.playback_position_ticks,
        runtime_ticks: item.runtime_ticks,
        season_number: item.season_number,
        episode_number: item.episode_number,
      }));
    });

    const results = await Promise.all(promises);

    // Check availability in catalog
    const tmdbIds = continueWatchingData.map(item => item.id);
    const { data: catalogData, error: catalogError } = await supabaseAdmin
      .from('catalog_items')
      .select('tmdb_id, jellyfin_id')
      .in('tmdb_id', tmdbIds);

    if (catalogError) {
      console.error("Error checking catalog availability", catalogError);
    }

    // Create availability map
    const availabilityMap = new Map();
    if (catalogData) {
      for (const item of catalogData) {
        availabilityMap.set(item.tmdb_id, item.jellyfin_id ? true : false);
      }
    }

    // Add availability to results
    const resultsWithAvailability = results.map((item) => ({
      ...item,
      isAvailable: availabilityMap.get(item.id) || false,
    }));

    return new Response(JSON.stringify(resultsWithAvailability), {
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
