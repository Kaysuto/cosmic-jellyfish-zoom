/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fonction pour catégoriser les bibliothèques
const categorizeLibrary = (libraryName: string, collectionType: string) => {
  const name = libraryName.toLowerCase()
  
  // Catégories spécifiques
  if (name.includes('kaï') || name.includes('kai')) {
    return 'kai'
  }
  if (name.includes('anime') || name.includes('animés') || name.includes('animes')) {
    return 'animes'
  }
  if (name.includes('animation') || name.includes('animé')) {
    return 'animations'
  }
  if (name.includes('série') || name.includes('series') || name.includes('tv') || collectionType === 'tvshows') {
    return 'series'
  }
  if (name.includes('film') || name.includes('movie') || collectionType === 'movies') {
    return 'films'
  }
  
  // Fallback basé sur le type de collection
  return collectionType === 'movies' ? 'films' : 'series'
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

    // Get Jellyfin settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('jellyfin_settings')
      .select('*')
      .single()

    if (settingsError || !settings) {
      throw new Error('Jellyfin settings not found')
    }

    // Call Jellyfin API to trigger library scan
    const jellyfinUrl = settings.url
    const apiKey = settings.api_key

    console.log('Jellyfin URL:', jellyfinUrl)
    console.log('API Key available:', !!apiKey)

    // Get server info
    const systemInfoResponse = await fetch(`${jellyfinUrl}/System/Info`, {
      headers: {
        'X-Emby-Token': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!systemInfoResponse.ok) {
      console.error('System info response error:', systemInfoResponse.status, systemInfoResponse.statusText)
      throw new Error(`Failed to get system info: ${systemInfoResponse.statusText}`)
    }

    const serverInfo = await systemInfoResponse.json()

    // Get library statistics first
    const statsResponse = await fetch(`${jellyfinUrl}/Items/Counts`, {
      headers: {
        'X-Emby-Token': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!statsResponse.ok) {
      console.error('Stats response error:', statsResponse.status, statsResponse.statusText)
      throw new Error(`Failed to get library stats: ${statsResponse.statusText}`)
    }

    const globalStats = await statsResponse.json()
    console.log('Global library stats:', globalStats)

    // Get users (for user_count)
    let users: any[] = []
    try {
      const usersResponse = await fetch(`${jellyfinUrl}/Users`, {
        headers: {
          'X-Emby-Token': apiKey,
          'Content-Type': 'application/json',
        },
      })
      if (usersResponse.ok) {
        users = await usersResponse.json()
      }
    } catch (_e) {
      // ignore
    }

    // Get all libraries
    const librariesResponse = await fetch(`${jellyfinUrl}/Library/VirtualFolders`, {
      headers: {
        'X-Emby-Token': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!librariesResponse.ok) {
      console.error('Libraries response error:', librariesResponse.status, librariesResponse.statusText)
      throw new Error(`Failed to get libraries: ${librariesResponse.statusText}`)
    }

    const libraries = await librariesResponse.json()
    console.log('Libraries found:', libraries)

    // Get detailed stats for each library
    const libraryStats: any[] = []
    const categorizedStats = {
      animations: { movies: 0, series: 0, episodes: 0, total: 0 },
      series: { movies: 0, series: 0, episodes: 0, total: 0 },
      films: { movies: 0, series: 0, episodes: 0, total: 0 },
      kai: { movies: 0, series: 0, episodes: 0, total: 0 },
      animes: { movies: 0, series: 0, episodes: 0, total: 0 }
    }

    for (const library of libraries) {
      try {
        console.log(`Getting stats for library: ${library.Name} (${library.CollectionType})`)
        
        // Get items count for this specific library using the correct endpoint
        const libraryItemsResponse = await fetch(`${jellyfinUrl}/Items/Counts?ParentId=${library.ItemId}&IncludeItemTypes=Movie,Series,Episode`, {
          headers: {
            'X-Emby-Token': apiKey,
            'Content-Type': 'application/json',
          },
        })

        if (libraryItemsResponse.ok) {
          const libraryItems = await libraryItemsResponse.json()
          
          // Also get the actual items to count them properly
          const itemsResponse = await fetch(`${jellyfinUrl}/Items?ParentId=${library.ItemId}&IncludeItemTypes=Movie,Series,Episode&Recursive=true`, {
            headers: {
              'X-Emby-Token': apiKey,
              'Content-Type': 'application/json',
            },
          })

          let movieCount = 0
          let seriesCount = 0
          let episodeCount = 0

          if (itemsResponse.ok) {
            const items = await itemsResponse.json()
            
            // Count items by type
            items.Items?.forEach((item: any) => {
              if (item.Type === 'Movie') movieCount++
              else if (item.Type === 'Series') seriesCount++
              else if (item.Type === 'Episode') episodeCount++
            })
          } else {
            // Fallback to counts API
            movieCount = libraryItems.MovieCount || 0
            seriesCount = libraryItems.SeriesCount || 0
            episodeCount = libraryItems.EpisodeCount || 0
          }
          
          const totalCount = movieCount + seriesCount + episodeCount
          
          // Catégoriser la bibliothèque
          const category = categorizeLibrary(library.Name, library.CollectionType)
          
          // Ajouter aux statistiques catégorisées
          if (categorizedStats[category]) {
            categorizedStats[category].movies += movieCount
            categorizedStats[category].series += seriesCount
            categorizedStats[category].episodes += episodeCount
            categorizedStats[category].total += totalCount
          }
          
          libraryStats.push({
            id: library.ItemId,
            name: library.Name,
            collectionType: library.CollectionType,
            category: category,
            path: library.Locations?.[0] || '',
            stats: {
              movieCount,
              seriesCount,
              episodeCount,
              totalCount,
            }
          })
          
          console.log(`Library ${library.Name} (${category}) stats:`, { movieCount, seriesCount, episodeCount })
        } else {
          console.log(`Failed to get stats for library ${library.Name}:`, libraryItemsResponse.statusText)
        }
      } catch (error) {
        console.error(`Error getting stats for library ${library.Name}:`, error)
      }
    }

    // Try to trigger library scan (optional - some Jellyfin instances don't support this)
    try {
      const scanResponse = await fetch(`${jellyfinUrl}/Library/VirtualFolders/LibraryScan`, {
        method: 'POST',
        headers: {
          'X-Emby-Token': apiKey,
          'Content-Type': 'application/json',
        },
      })

      if (scanResponse.ok) {
        console.log('Library scan triggered successfully')
      } else {
        console.log('Library scan not supported or failed, but continuing...')
      }
    } catch (scanError) {
      console.log('Library scan error (non-critical):', scanError)
      // Continue even if scan fails
    }

    // Persist current state in Supabase (upsert, no duplicates)
    try {
      const libraryInfo = {
        movieCount: globalStats.MovieCount || 0,
        seriesCount: globalStats.SeriesCount || 0,
      }

      // Upsert statistics state (single row id=1)
      const { error: statsStateError } = await supabaseClient
        .from('jellyfin_statistics_state')
        .upsert({
          id: 1,
          server_info: serverInfo,
          library_info: libraryInfo,
          categorized_stats: categorizedStats,
          user_count: Array.isArray(users) ? users.length : 0,
          last_sync: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (statsStateError) {
        console.error('Failed to upsert jellyfin_statistics_state:', statsStateError)
      }

      // Upsert libraries state (one row per library id)
      const libsRows = libraryStats.map((lib: any) => ({
        id: String(lib.id),
        name: lib.name,
        collection_type: lib.collectionType,
        category: lib.category,
        path: lib.path,
        movie_count: lib.stats.movieCount,
        series_count: lib.stats.seriesCount,
        episode_count: lib.stats.episodeCount,
        last_sync: new Date().toISOString(),
      }))

      if (libsRows.length > 0) {
        const { error: libsStateError } = await supabaseClient
          .from('jellyfin_libraries_state')
          .upsert(libsRows, { onConflict: 'id' })
        if (libsStateError) {
          console.error('Failed to upsert jellyfin_libraries_state:', libsStateError)
        }
      }
    } catch (persistError) {
      console.error('Error persisting jellyfin state:', persistError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Library synchronized successfully',
        globalStats: {
          movieCount: globalStats.MovieCount || 0,
          seriesCount: globalStats.SeriesCount || 0,
          episodeCount: globalStats.EpisodeCount || 0,
          totalCount: (globalStats.MovieCount || 0) + (globalStats.SeriesCount || 0) + (globalStats.EpisodeCount || 0),
        },
        libraries: libraryStats,
        categorizedStats: categorizedStats,
        totalLibraries: libraryStats.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in sync-jellyfin-library:', error)
    
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
