/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TVDB_API_KEY = Deno.env.get('THETVDB_API_KEY');
const TVDB_API_URL = 'https://api4.thetvdb.com/v4';

let tvdbToken: string | null = null;
let tokenExpiry: number | null = null;

async function getTvdbToken() {
  if (tvdbToken && tokenExpiry && Date.now() < tokenExpiry) {
    return tvdbToken;
  }
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
    tvdbToken = data.data.token;
    tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // Cache for 24 hours
    return tvdbToken;
  } catch (e) {
    console.error("Exception while getting TVDB token", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { mediaType, language, startDate, endDate } = await req.json();
    if (!mediaType || !startDate || !endDate) {
      throw new Error("mediaType, startDate, and endDate are required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = await getTvdbToken();

    let allResults = [];
    let page = 1;
    let totalPages = 1;
    const baseParams = `api_key=${TMDB_API_KEY}&language=${language || 'en-US'}&air_date.gte=${startDate}&air_date.lte=${endDate}`;
    let discoverUrl;
    if (mediaType === 'anime') {
      discoverUrl = `${TMDB_API_URL}/discover/tv?${baseParams}&with_genres=16&with_origin_country=JP`;
    } else if (mediaType === 'series') {
      discoverUrl = `${TMDB_API_URL}/discover/tv?${baseParams}&without_genres=16&without_origin_country=JP,KR,CN`;
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
      
      const seriesAiring = data.results;
      const detailedPromises = seriesAiring.map(async (series) => {
        if (!token) return [{ ...series, media_type: 'tv' }];

        try {
          const externalIdsUrl = `${TMDB_API_URL}/tv/${series.id}/external_ids?api_key=${TMDB_API_KEY}`;
          const idsResponse = await fetch(externalIdsUrl);
          if (!idsResponse.ok) return [{ ...series, media_type: 'tv' }];
          const externalIds = await idsResponse.json();
          const tvdbId = externalIds.tvdb_id;

          if (!tvdbId) return [{ ...series, media_type: 'tv' }];

          const episodesUrl = `${TVDB_API_URL}/series/${tvdbId}/episodes/default?page=0`;
          const episodesResponse = await fetch(episodesUrl, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!episodesResponse.ok) return [{ ...series, media_type: 'tv' }];
          const episodesData = await episodesResponse.json();
          if (!episodesData.data || !episodesData.data.episodes) return [{ ...series, media_type: 'tv' }];
          
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);

          const airingEpisodes = episodesData.data.episodes.filter(ep => {
            if (!ep.aired) return false;
            const airedDate = new Date(ep.aired);
            return airedDate >= start && airedDate <= end;
          });

          if (airingEpisodes.length === 0) {
            return [{ ...series, media_type: 'tv', first_air_date: series.first_air_date }];
          }

          return airingEpisodes.map(ep => ({
            ...series,
            media_type: 'tv',
            first_air_date: ep.aired,
            seasonNumber: ep.seasonNumber,
            episodeNumber: ep.number,
            episodeName: ep.name,
            tvdb_episode_id: ep.id,
          }));
        } catch (e) {
          console.error(`Error processing series ${series.id}:`, e.message);
          return [{ ...series, media_type: 'tv' }];
        }
      });

      const resultsBySeries = await Promise.all(detailedPromises);
      allResults = allResults.concat(resultsBySeries.flat());

      totalPages = data.total_pages;
      page++;
    } while (page <= totalPages && page < 10);

    const uniqueResults = Array.from(new Map(allResults.map(item => [`${item.id}-${item.first_air_date}`, item])).values());

    const tmdbIds = [...new Set(uniqueResults.map(item => item.id))];
    if (tmdbIds.length > 0) {
      const { data: catalogData, error: catalogError } = await supabaseAdmin
        .from('catalog_items')
        .select('tmdb_id, jellyfin_id')
        .in('tmdb_id', tmdbIds);

      if (catalogError) throw catalogError;

      const jellyfinIdMap = new Map(catalogData.map(item => [item.tmdb_id, item.jellyfin_id]));
      
      const { data: episodeData, error: episodeError } = await supabaseAdmin
        .from('jellyfin_episodes')
        .select('tvdb_id');
      
      if (episodeError) throw episodeError;

      const existingEpisodeTvdbIds = new Set(episodeData.map(ep => ep.tvdb_id).filter(Boolean));

      uniqueResults.forEach(item => {
        const jellyfinId = jellyfinIdMap.get(item.id);
        if (jellyfinId) {
          if (item.media_type === 'movie') {
            item.isAvailable = true;
          } else if (item.tvdb_episode_id) {
            if (existingEpisodeTvdbIds.has(item.tvdb_episode_id)) {
              item.isAvailable = true;
            } else {
              item.isSoon = true;
            }
          }
        }
      });
    }

    return new Response(JSON.stringify(uniqueResults), {
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