/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const itemId = url.searchParams.get('itemId');

    if (!itemId) {
      throw new Error("itemId is required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('jellyfin_settings')
      .select('url, api_key')
      .single();

    if (settingsError || !settings || !settings.url || !settings.api_key) {
      throw new Error('Jellyfin settings are not configured.');
    }

    // Construct URL with api_key and Static=true for stateless authentication
    const streamUrl = `${settings.url}/Videos/${itemId}/stream?api_key=${settings.api_key}&Static=true&Container=mp4`;

    // Proxy the request, including the Range header for seeking
    const range = req.headers.get('range');
    const headers = new Headers();
    if (range) {
      headers.set('range', range);
    }

    const jellyfinResponse = await fetch(streamUrl, { headers });

    if (!jellyfinResponse.ok) {
      const errorBody = await jellyfinResponse.text();
      console.error(`Jellyfin server returned an error: ${jellyfinResponse.status}`, {
        url: streamUrl,
        body: errorBody,
      });
      throw new Error(`Jellyfin server error: ${jellyfinResponse.status} ${jellyfinResponse.statusText}. This could be due to an invalid API key or network issue.`);
    }

    // Create a new response that streams the body from Jellyfin
    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set('Content-Type', jellyfinResponse.headers.get('Content-Type') || 'video/mp4');
    responseHeaders.set('Content-Length', jellyfinResponse.headers.get('Content-Length') || '0');
    responseHeaders.set('Accept-Ranges', 'bytes');
    if (jellyfinResponse.headers.get('Content-Range')) {
        responseHeaders.set('Content-Range', jellyfinResponse.headers.get('Content-Range'));
    }

    return new Response(jellyfinResponse.body, {
      status: jellyfinResponse.status,
      headers: responseHeaders,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})