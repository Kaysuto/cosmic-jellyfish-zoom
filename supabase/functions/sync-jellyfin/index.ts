/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

class JellyfinClient {
  private baseUrl: string;
  private apiKey: string;
  private userId?: string;
  private accessToken?: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.apiKey = apiKey;
  }

  async authenticate() {
    console.log('Attempting to authenticate with Jellyfin...');
    
    const authResponse = await fetch(`${this.baseUrl}/Users/AuthenticateWithKey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Authorization': `MediaBrowser ApiKey="${this.apiKey}"`,
      },
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error(`Jellyfin authentication failed: ${authResponse.status} ${errorText}`);
      throw new Error(`Jellyfin authentication failed: ${authResponse.status}`);
    }
    
    const authData = await authResponse.json();
    this.accessToken = authData.AccessToken;
    this.userId = authData.User.Id;
    console.log(`Successfully authenticated with Jellyfin as user ${authData.User.Name}.`);
  }

  // We will add more methods here later, like getLibraryItems()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('jellyfin_settings')
      .select('url, api_key')
      .single();

    if (settingsError) throw new Error(`Failed to fetch Jellyfin settings: ${settingsError.message}`);
    if (!settings || !settings.url || !settings.api_key) {
      throw new Error('Jellyfin URL or API key is not configured in settings.');
    }

    console.log('Jellyfin settings loaded. Initializing client...');
    const jellyfin = new JellyfinClient(settings.url, settings.api_key);
    await jellyfin.authenticate();

    // TODO:
    // 2. Fetch library items from Jellyfin
    // 3. Filter out excluded items (e.g., "Kaï")
    // 4. Process each item to get TMDB/TVDB IDs
    // 5. Upsert items into the `catalog_items` table in Supabase

    const response = {
      message: "Jellyfin sync started. Authentication successful. Library sync not yet implemented.",
      details: "This is a placeholder response. The full synchronization logic will be built in the next steps."
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in sync-jellyfin function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})