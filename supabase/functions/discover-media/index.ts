/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// Définition des sections du catalogue
const CATALOG_SECTIONS = {
  'animations': {
    name: 'Animations',
    description: 'Films d\'animation occidentaux',
    mediaType: 'movie',
    filters: {
      with_genres: '16', // Animation
      without_genres: '10751', // Family (pour exclure les films pour enfants)
      without_origin_country: 'JP,KR,CN' // Exclure les productions asiatiques
    }
  },
  'animes': {
    name: 'Animés',
    description: 'Productions animées asiatiques',
    mediaType: 'tv',
    filters: {
      with_genres: '16', // Animation
      with_origin_country: 'JP' // Japon uniquement (comme l'ancienne logique)
    }
  },
  'films': {
    name: 'Films',
    description: 'Films en prise de vue réelle',
    mediaType: 'movie',
    filters: {
      without_genres: '16', // Exclure Animation
      without_origin_country: 'JP,KR,CN' // Exclure les productions asiatiques
    }
  },
  'series': {
    name: 'Séries',
    description: 'Séries en prise de vue réelle',
    mediaType: 'tv',
    filters: {
      without_genres: '16', // Exclure Animation
      without_origin_country: 'JP,KR,CN' // Exclure les productions asiatiques
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  if (!TMDB_API_KEY) {
    return new Response(JSON.stringify({ error: 'TMDB API key is not configured.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const { section, language, page, sortBy, genres, studios, networks, keywords, availableOnly } = await req.json();
    
    if (!section) {
      throw new Error("section is required (animations, animes, films, or series)");
    }

    const sectionConfig = CATALOG_SECTIONS[section];
    if (!sectionConfig) {
      throw new Error(`Invalid section: ${section}. Valid sections are: ${Object.keys(CATALOG_SECTIONS).join(', ')}`);
    }

    let params = `api_key=${TMDB_API_KEY}&language=${language || 'en-US'}&page=${page || 1}&sort_by=${sortBy || 'popularity.desc'}`;
    
    // Appliquer les filtres de base de la section
    if (sectionConfig.filters.with_genres) {
      params += `&with_genres=${sectionConfig.filters.with_genres}`;
    }
    if (sectionConfig.filters.without_genres) {
      params += `&without_genres=${sectionConfig.filters.without_genres}`;
    }
    if (sectionConfig.filters.with_origin_country) {
      params += `&with_origin_country=${sectionConfig.filters.with_origin_country}`;
    }
    if (sectionConfig.filters.without_origin_country) {
      params += `&without_origin_country=${sectionConfig.filters.without_origin_country}`;
    }

    // Appliquer les filtres additionnels
    if (genres) {
      params += `&with_genres=${genres}`;
    }
    if (keywords) {
      params += `&with_keywords=${keywords}`;
    }

    if (studios && sectionConfig.mediaType === 'movie') {
      params += `&with_companies=${studios}`;
    }
    if (networks && sectionConfig.mediaType === 'tv') {
      params += `&with_networks=${networks}`;
    }

    const discoverUrl = `${TMDB_API_URL}/discover/${sectionConfig.mediaType}?${params}`;
    
    const response = await fetch(discoverUrl);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    const data = await response.json();

    let results = data.results;

    if (availableOnly && results.length > 0) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const tmdbIds = results.map(item => item.id);
      
      const { data: catalogData, error: catalogError } = await supabaseAdmin
        .from('catalog_items')
        .select('tmdb_id')
        .in('tmdb_id', tmdbIds);

      if (catalogError) {
        console.error("Error checking catalog availability in function", catalogError);
      } else {
        const availableIds = new Set(catalogData.map(item => item.tmdb_id));
        results = results.filter(item => availableIds.has(item.id));
      }
    }

    // Ajouter le type de média et la section aux résultats
    const resultsWithMetadata = results.map(item => ({
        ...item,
        media_type: sectionConfig.mediaType,
        catalog_section: section
    }));

    return new Response(JSON.stringify({
        page: data.page,
        results: resultsWithMetadata,
        total_pages: data.total_pages,
        total_results: data.total_results,
        section: section,
        section_config: sectionConfig
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})