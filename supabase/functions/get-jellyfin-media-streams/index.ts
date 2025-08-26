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
   // Try AuthenticateWithKey, fallback to direct token / users list
   try {
     const authResponse = await fetch(`${this.baseUrl}/Users/AuthenticateWithKey`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'X-Emby-Authorization': `MediaBrowser ApiKey="${this.apiKey}"`,
       },
     });

     if (!authResponse.ok) {
       const text = await authResponse.text().catch(() => '');
       throw new Error(`AuthenticateWithKey failed: ${authResponse.status} ${text}`);
     }

     const authData = await authResponse.json().catch(() => null);
     if (!authData || !authData.AccessToken || !authData.User?.Id) {
       throw new Error('AuthenticateWithKey returned unexpected payload.');
     }

     this.accessToken = authData.AccessToken;
     this.userId = authData.User.Id;
     return;
   } catch (authErr) {
     // Fallback: try GET /Users with direct token (some Jellyfin configs use token only)
     try {
       const directTokenResponse = await fetch(`${this.baseUrl}/Users`, {
         method: 'GET',
         headers: { 'X-Emby-Token': this.apiKey, 'Content-Type': 'application/json' },
       });

       if (!directTokenResponse.ok) {
         const t = await directTokenResponse.text().catch(() => '');
         throw new Error(`Direct token users request failed: ${directTokenResponse.status} ${t}`);
       }

       const users = await directTokenResponse.json().catch(() => null);
       if (!Array.isArray(users) || users.length === 0) {
         throw new Error('Direct token auth succeeded but returned no users.');
       }

       this.useDirectToken = true;
       const adminUser = users.find(u => u.Policy?.IsAdministrator);
       this.userId = adminUser ? adminUser.Id : users[0]?.Id;
       if (!this.userId) throw new Error('Direct token auth succeeded, but could not retrieve a user ID.');
       return;
     } catch (fallbackErr) {
       // Re-throw a combined error for logging upstream
       console.error('Jellyfin authenticate errors:', { authErr: authErr?.message, fallbackErr: fallbackErr?.message });
       throw new Error('Jellyfin authentication failed for both methods.');
     }
   }
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

   const json = await response.json().catch(() => null);
   if (!json) throw new Error('PlaybackInfo returned invalid JSON.');
   return json;
 }
}

serve(async (req) => {
 if (req.method === 'OPTIONS') {
   return new Response('ok', { headers: corsHeaders, status: 200 })
 }

 try {
   // Parse body defensively
   let body: any = null;
   try {
     body = await req.json();
   } catch (err) {
     console.error('Failed to parse request JSON', err);
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

   const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
   const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
   if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
     console.error('Missing SUPABASE env vars', { SUPABASE_URL: !!SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY });
     return new Response(JSON.stringify({ error: 'Server misconfiguration: missing supabase env vars' }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 500,
     });
   }

   const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

   const { data: settings, error: settingsError } = await supabaseAdmin
     .from('jellyfin_settings')
     .select('url, api_key')
     .single();

   if (settingsError || !settings || !settings.url || !settings.api_key) {
     console.error('Jellyfin settings missing or invalid', { settingsError: settingsError?.message, settings });
     return new Response(JSON.stringify({ error: 'Jellyfin settings are not configured.' }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 500,
     });
   }

   const jellyfin = new JellyfinClient(settings.url, settings.api_key);

   // Defensive call to Jellyfin - surface useful diagnostics on failure
   let playbackInfo: any;
   try {
     playbackInfo = await jellyfin.getPlaybackInfo(String(jellyfinId));
   } catch (jfErr) {
     console.error('Error fetching playback info from Jellyfin', { jellyfinId, err: jfErr?.message });
     return new Response(JSON.stringify({ error: `Jellyfin error: ${jfErr?.message}` }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 502,
     });
   }

   const mediaSource = playbackInfo?.MediaSources?.[0];
   if (!mediaSource) {
     console.error('No media sources in playbackInfo', { playbackInfo });
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
   // Final catch-all: log details for debugging
   console.error('Unhandled error in get-jellyfin-media-streams function', error);
   return new Response(JSON.stringify({ error: (error && error.message) ? error.message : String(error) }), {
     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
     status: 500,
   });
 }
})