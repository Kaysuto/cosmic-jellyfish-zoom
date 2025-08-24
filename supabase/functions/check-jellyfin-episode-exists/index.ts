/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
// @ts-nocheck

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { seriesJellyfinId, seasonNumber, episodeNumber } = await req.json();
    if (!seriesJellyfinId || seasonNumber === undefined || episodeNumber === undefined) {
      throw new Error("seriesJellyfinId, seasonNumber, and episodeNumber are required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error, count } = await supabaseAdmin
      .from('jellyfin_episodes')
      .select('id', { count: 'exact', head: true })
      .eq('series_jellyfin_id', seriesJellyfinId)
      .eq('season_number', seasonNumber)
      .eq('episode_number', episodeNumber);

    if (error) {
      console.error('Error checking episode existence:', error);
      throw error;
    }

    return new Response(JSON.stringify({ exists: (count || 0) > 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})