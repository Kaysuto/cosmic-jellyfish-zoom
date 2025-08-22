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

  private async getAuthHeaders() {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }
    return {
      'Content-Type': 'application/json',
      'X-Emby-Authorization': `MediaBrowser ApiKey="${this.apiKey}", Token="${this.accessToken}"`,
    };
  }

  async getViews() {
    console.log('Fetching user views/libraries...');
    const response = await fetch(`${this.baseUrl}/Users/${this.userId}/Views`, {
      headers: await this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch Jellyfin views.');
    }
    const data = await response.json();
    console.log(`Found ${data.Items.length} views.`);
    return data.Items;
  }

  async getLibraryItems(viewId: string) {
    console.log(`Fetching items for view ${viewId}...`);
    let allItems: any[] = [];
    let startIndex = 0;
    const limit = 200; // Number of items to fetch per request

    while (true) {
      const url = `${this.baseUrl}/Users/${this.userId}/Items?ParentId=${viewId}&Recursive=true&IncludeItemTypes=Movie,Series&fields=ProviderIds&StartIndex=${startIndex}&Limit=${limit}`;
      const response = await fetch(url, {
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        console.error(`Failed to fetch items for view ${viewId} at index ${startIndex}`);
        break;
      }

      const data = await response.json();
      if (data.Items.length === 0) {
        break; // No more items
      }

      allItems = allItems.concat(data.Items);
      startIndex += data.Items.length;

      if (startIndex >= data.TotalRecordCount) {
        break;
      }
    }
    console.log(`Fetched ${allItems.length} total items for view ${viewId}.`);
    return allItems;
  }
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

    const jellyfin = new JellyfinClient(settings.url, settings.api_key);
    await jellyfin.authenticate();

    const views = await jellyfin.getViews();
    let allLibraryItems: any[] = [];

    for (const view of views) {
      const items = await jellyfin.getLibraryItems(view.Id);
      allLibraryItems = allLibraryItems.concat(items);
    }

    console.log(`Total items fetched from all libraries: ${allLibraryItems.length}`);

    // Filter out any series with "Kaï" in the name
    const excludedName = "kaï";
    const filteredItems = allLibraryItems.filter(item => 
      !(item.Name && item.Name.toLowerCase().includes(excludedName))
    );

    const excludedCount = allLibraryItems.length - filteredItems.length;
    console.log(`Excluded ${excludedCount} items containing '${excludedName}'.`);
    console.log(`Items to be processed: ${filteredItems.length}`);

    // For now, we just log the first few items to see the structure
    console.log('Sample of items to be processed:', filteredItems.slice(0, 3));

    // TODO:
    // 1. Process each item to get TMDB/TVDB IDs
    // 2. Upsert items into the `catalog_items` table in Supabase

    const response = {
      message: "Jellyfin sync step 2 complete. Fetched and filtered library items.",
      totalItemsFetched: allLibraryItems.length,
      itemsExcluded: excludedCount,
      itemsToProcess: filteredItems.length,
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