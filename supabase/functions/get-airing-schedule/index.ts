/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TVDB_API_KEY = Deno.env.get('THETVDB_API_KEY');
const TVDB_API_URL = 'https://api4.thetvdb.com/v4';

async function getTvdbToken() {
  if (!TVDB_API_KEY) return null;
  try {
    const response = await fetch(`${TVDB_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ apikey: TVDB_API_KEY }),
    });
    if (!response.ok) {
      console.error("Failed to get TVDB token, status:", response.status);
      return null;
    }
    const data = await response.json();
    return data.data.token;
  } catch (e) {
    console.error("Exception while getting TVDB token", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { mediaType, language, startDate, endDate } = await req.json();
    if (!mediaType || !startDate || !endDate) {
      throw new Error("mediaType, startDate, and endDate are required");
    }

    // New Hybrid Logic for Anime using TheTVDB
    if (mediaType === 'anime' && TVDB_API_KEY) {
      const tvdbToken = await getTvdbToken();
      if (!tvdbToken) {
        console.error('Could not authenticate with TheTVDB. Falling back to TMDB-only.');
      } else {
        // 1. Get popular anime from TMDB
        const discoverUrl = `${TMDB_API_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=${language}&sort_by=popularity.desc&with_genres=16&with_origin_country=JP&page=1`;
        const tmdbResponse = await fetch(discoverUrl);
        if (!tmdbResponse.ok) throw new Error('Failed to fetch popular anime from TMDB.');
        const tmdbData = await tmdbResponse.json();
        const popularAnimeSeries = tmdbData.results;

        const schedulePromises = popularAnimeSeries.map(async (series) => {
          try {
            // 2. Get external IDs from TMDB
            const externalIdsUrl = `${TMDB_API_URL}/tv/${series.id}/external_ids?api_key=${TMDB_API_KEY}`;
            const idsResponse = await fetch(externalIdsUrl);
            if (!idsResponse.ok) return [];
            const externalIds = await idsResponse.json();
            const tvdbId = externalIds.tvdb_id;

            if (!tvdbId) return [];

            // 3. Get episodes from TheTVDB
            const episodesUrl = `${TVDB_API_URL}/series/${tvdbId}/episodes/default?page=0`;
            const episodesResponse = await fetch(episodesUrl, {
              headers: { 'Authorization': `Bearer ${tvdbToken}` },
            });
            if (!episodesResponse.ok) return [];
            const episodesData = await episodesResponse.json();
            if (!episodesData.data || !episodesData.data.episodes) return [];
            const episodes = episodesData.data.episodes;

            // 4. Filter episodes within the date range
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Ensure end of day is included

            const airingEpisodes = episodes.filter(ep => {
              if (!ep.aired) return false;
              const airedDate = new Date(ep.aired);
              return airedDate >= start && airedDate <= end;
            });

            // 5. Format results
            return airingEpisodes.map(ep => ({
              ...series,
              media_type: 'tv',
              first_air_date: ep.aired,
            }));
          } catch (e) {
            console.error(`Error processing series ${series.id}:`, e.message);
            return [];
          }
        });

        const resultsBySeries = await Promise.all(schedulePromises);
        const finalResults = resultsBySeries.flat();
        
        const uniqueResults = Array.from(new Map(finalResults.map(item => [`${item.id}-${item.first_air_date}`, item])).values());

        return new Response(JSON.stringify(uniqueResults), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    // Fallback / Original Logic for TV and if TVDB fails
    let allResults = [];
    let page = 1;
    let totalPages = 1;
    const baseParams = `api_key=${TMDB_API_KEY}&language=${language || 'en-US'}&air_date.gte=${startDate}&air_date.lte=${endDate}`;
    let discoverUrl;
    if (mediaType === 'anime') {
      discoverUrl = `${TMDB_API_URL}/discover/tv?${baseParams}&with_genres=16&with_origin_country=JP`;
    } else {
      discoverUrl = `${TMDB_API_URL}/discover/tv?${baseParams}`;
    }

    do {
      const response = await fetch(`${discoverUrl}&page=${page}`);
      if (!response.ok) {
        const errorBody = await response.json();
        console.error('TMDB API Error:', errorBody);
        throw new Error(`TMDB API error: ${response.statusText}`);
      }
      const data = await response.json();
      const resultsWithMediaType = data.results.map(item => ({
          ...item,
          media_type: mediaType === 'anime' ? 'tv' : mediaType,
      }));
      allResults = allResults.concat(resultsWithMediaType);
      totalPages = data.total_pages;
      page++;
    } while (page <= totalPages && page < 50);

    return new Response(JSON.stringify(allResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-airing-schedule function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})