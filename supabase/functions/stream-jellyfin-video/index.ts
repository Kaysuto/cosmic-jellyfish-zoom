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

    const range = req.headers.get('range');
    let jellyfinResponse;

    // --- Multi-Method Authentication Logic ---

    // Method 1: Session-based authentication (most robust)
    try {
      const authResponse = await fetch(`${settings.url}/Users/AuthenticateByKey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Emby-Authorization': `MediaBrowser ApiKey="${settings.api_key}"` },
        body: JSON.stringify({ ApiKey: settings.api_key }),
      });
      if (authResponse.ok) {
        const session = await authResponse.json();
        const accessToken = session.AccessToken;
        if (accessToken) {
          const sessionHeaders = new Headers();
          sessionHeaders.set('X-Emby-Authorization', `MediaBrowser Client="SupabaseProxy", Device="Proxy", DeviceId="supabase-proxy-streamer", Version="1.0", Token="${accessToken}"`);
          if (range) sessionHeaders.set('range', range);
          jellyfinResponse = await fetch(`${settings.url}/Videos/${itemId}/stream?Container=mp4`, { headers: sessionHeaders });
        }
      }
    } catch (e) {
      console.warn("Session auth failed, trying next method.", e.message);
    }

    // Method 2: Direct token authentication (if method 1 failed)
    if (!jellyfinResponse || !jellyfinResponse.ok) {
      console.log("Trying direct token (X-Emby-Token) authentication.");
      const directTokenHeaders = new Headers();
      directTokenHeaders.set('X-Emby-Token', settings.api_key);
      if (range) directTokenHeaders.set('range', range);
      jellyfinResponse = await fetch(`${settings.url}/Videos/${itemId}/stream?Container=mp4`, { headers: directTokenHeaders });
    }

    // Method 3: Static API key in URL (if method 2 also failed)
    if (!jellyfinResponse || !jellyfinResponse.ok) {
      console.log("Trying static API key in URL authentication.");
      const staticUrl = `${settings.url}/Videos/${itemId}/stream?api_key=${settings.api_key}&Static=true&Container=mp4`;
      const staticHeaders = new Headers();
      if (range) staticHeaders.set('range', range);
      jellyfinResponse = await fetch(staticUrl, { headers: staticHeaders });
    }

    // --- End of Multi-Method Logic ---

    if (!jellyfinResponse || !jellyfinResponse.ok) {
      const status = jellyfinResponse?.status || 500;
      throw new Error(`Jellyfin server error: ${status}. All authentication methods failed. Please check your API key permissions and Jellyfin server logs.`);
    }

    // Proxy the successful response back to the client
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