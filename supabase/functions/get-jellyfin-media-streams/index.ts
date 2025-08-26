/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

class JellyfinClient {
 baseUrl: string;
 apiKey: string;
 userId?: string;
 accessToken?: string;
 useDirectToken = false;

 constructor(baseUrl: string, apiKey: string) {
   this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
   this.apiKey = apiKey;
 }

 async authenticate() {
    let authKeyError: Error | null = null;
    let directTokenError: Error | null = null;

    // Attempt 1: AuthenticateWithKey
    try {
      const authResponse = await fetch(`${this.baseUrl}/Users/AuthenticateWithKey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Emby-Authorization': `MediaBrowser ApiKey="${this.apiKey}"`,
        },
      });
      if (!authResponse.ok) {
        const errorBody = await authResponse.text().catch(() => `Status: ${authResponse.status}`);
        throw new Error(`AuthenticateWithKey failed. Status: ${authResponse.status}. Response: ${errorBody}`);
      }
      const authData = await authResponse.json();
      this.accessToken = authData.AccessToken;
      this.userId = authData.User.Id;
      return; // Success
    } catch (err) {
      authKeyError = err;
    }

    // Attempt 2: Direct Token Authentication
    try {
      const directTokenResponse = await fetch(`${this.baseUrl}/Users`, {
        headers: { 'X-Emby-Token': this.apiKey, 'Content-Type': 'application/json' },
      });
      if (!directTokenResponse.ok) {
        const errorBody = await directTokenResponse.text().catch(() => `Status: ${directTokenResponse.status}`);
        throw new Error(`Direct token auth failed. Status: ${directTokenResponse.status}. Response: ${errorBody}`);
      }
      
      this.useDirectToken = true;
      const users = await directTokenResponse.json();
      if (Array.isArray(users) && users.length > 0) {
        const adminUser = users.find(u => u.Policy?.IsAdministrator);
        this.userId = adminUser ? adminUser.Id : users[0].Id;
        return; // Success
      } else {
        throw new Error('Direct token auth succeeded, but could not retrieve a user ID.');
      }
    } catch (err) {
      directTokenError = err;
    }

    // If both failed, throw a detailed error
    const errorMessage = `Jellyfin authentication failed for all methods. Please check your Jellyfin URL and API Key.
    - URL Tried: ${this.baseUrl}
    - API Key Auth Error: ${authKeyError?.message || 'N/A'}
    - Direct Token Auth Error: ${directTokenError?.message || 'N/A'}`;
    
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

 private async getAuthHeaders() {
   if (this.useDirectToken) {
     return { 'Content-Type': 'application/json', 'X-Emby-Token': this.apiKey };
   }
   if (!this.accessToken) throw new Error('Not authenticated.');
   return {
     'Content-Type': 'application/json',
     'X-Emby-Authorization': `MediaBrowser ApiKey="${this.apiKey}", Token="${this.accessToken}"`,
   };
 }

 async getPlaybackInfo(itemId: string) {
   if (!this.userId) await this.authenticate();
   const url = `${this.baseUrl}/Items/${itemId}/PlaybackInfo?userId=${this.userId}`;
   const response = await fetch(url, {
     method: 'POST',
     headers: await this.getAuthHeaders(),
   });

   if (!response.ok) {
     const body = await response.text().catch(() => '');
     throw new Error(`Failed to fetch PlaybackInfo for item ${itemId}: ${response.status} ${body}`);
   }

   return await response.json();
 }
}

serve(async (req) => {
 if (req.method === 'OPTIONS') {
   return new Response('ok', { headers: corsHeaders, status: 200 })
 }

 try {
   let body: any = null;
   try {
     body = await req.json();
   } catch (err) {
     return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 400,
     });
   }

   const jellyfinId = body?.jellyfinId ?? body?.jellyfin_id ?? body?.itemId;
   if (!jellyfinId) {
     return new Response(JSON.stringify({ error: "jellyfinId is required" }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 400,
     });
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
     return new Response(JSON.stringify({ error: 'Jellyfin settings are not configured.' }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 500,
     });
   }

   const jellyfin = new JellyfinClient(settings.url, settings.api_key);

   let playbackInfo: any;
   try {
     playbackInfo = await jellyfin.getPlaybackInfo(String(jellyfinId));
   } catch (jfErr) {
     // This will now contain the more detailed error from the authenticate method
     return new Response(JSON.stringify({ error: `Jellyfin error: ${jfErr?.message}` }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 502,
     });
   }

   const mediaSource = playbackInfo?.MediaSources?.[0];
   if (!mediaSource) {
     return new Response(JSON.stringify({ error: "No media sources found for this item on Jellyfin." }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 404,
     });
   }

   const audioTracks = (mediaSource.MediaStreams || []).filter((s: any) => s.Type === 'Audio');
   const subtitleTracks = (mediaSource.MediaStreams || []).filter((s: any) => s.Type === 'Subtitle');

   return new Response(JSON.stringify({
     audioTracks,
     subtitleTracks
   }), {
     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
     status: 200,
   });

 } catch (error) {
   return new Response(JSON.stringify({ error: (error && error.message) ? error.message : String(error) }), {
     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
     status: 500,
   });
 }
})