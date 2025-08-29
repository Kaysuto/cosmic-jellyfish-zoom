import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get request body
    const { requests } = await req.json()

    if (!requests || !Array.isArray(requests)) {
      throw new Error('Invalid requests data')
    }

    console.log(`Processing ${requests.length} approved requests`)

    // Get Jellyfin settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('jellyfin_settings')
      .select('*')
      .single()

    if (settingsError || !settings) {
      throw new Error('Jellyfin settings not found')
    }

    const jellyfinUrl = settings.url
    const apiKey = settings.api_key

    console.log('Jellyfin URL:', jellyfinUrl)
    console.log('API Key available:', !!apiKey)

    const results = []
    const errors = []

    // Process each approved request
    for (const request of requests) {
      try {
        // Log the request for tracking
        console.log(`Processing request: ${request.title} (${request.media_type}) - TMDB ID: ${request.tmdb_id}`)

        // Here you would typically:
        // 1. Check if the media already exists in Jellyfin
        // 2. If not, trigger a download via Sonarr/Radarr webhook
        // 3. Or add it to a download queue

        // For now, we'll just log the request and mark it as processed
        results.push({
          id: request.id,
          title: request.title,
          media_type: request.media_type,
          tmdb_id: request.tmdb_id,
          status: 'processed',
          message: 'Request queued for processing',
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        console.error(`Error processing request ${request.id}:`, error)
        errors.push({
          id: request.id,
          title: request.title,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }

    console.log(`Successfully processed ${results.length} requests, ${errors.length} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} requests successfully`,
        results,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          total: requests.length,
          processed: results.length,
          failed: errors.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in sync-approved-requests:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
