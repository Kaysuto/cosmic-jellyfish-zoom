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
    return new Response(null, { headers: corsHeaders })
  }

  // La vérification de l'authentification est maintenant gérée par la passerelle Supabase via l'en-tête 'apikey'.
  // Aucune vérification de secret supplémentaire n'est nécessaire ici.

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const payload = await req.json();
    
    // Radarr utilise movie.tmdbId, Sonarr v3/v4 utilise series.tvdbId ou series.tmdbId
    const tmdbId = payload.movie?.tmdbId || payload.series?.tmdbId;
    const eventType = payload.eventType;

    if (!tmdbId) {
      console.log('Webhook received but no TMDB ID found. Ignoring.');
      return new Response(JSON.stringify({ message: 'No TMDB ID found, ignoring.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (eventType !== 'Download' && eventType !== 'Import') {
       console.log(`Webhook received for event type '${eventType}', which is not 'Download' or 'Import'. Ignoring.`);
       return new Response(JSON.stringify({ message: `Ignoring event type ${eventType}` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabaseAdmin
      .from('media_requests')
      .update({ status: 'available', updated_at: new Date().toISOString() })
      .eq('tmdb_id', tmdbId)
      .in('status', ['pending', 'approved'])
      .select();

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      console.log(`Successfully updated ${data.length} request(s) for TMDB ID ${tmdbId} to 'available'.`);
    } else {
      console.log(`No 'pending' or 'approved' requests found for TMDB ID ${tmdbId}. Nothing to update.`);
    }

    return new Response(JSON.stringify({ message: 'Webhook processed successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing webhook:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})