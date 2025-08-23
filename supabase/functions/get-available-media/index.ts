/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { mediaType, limit = 20, page = 1, sortBy } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('catalog_items')
      .select('*', { count: 'exact' });

    if (mediaType) {
      const actualMediaType = mediaType === 'anime' ? 'tv' : mediaType;
      query = query.eq('media_type', actualMediaType);
      if (mediaType === 'anime') {
        query = query.contains('genres', ['Animation']);
      }
    }

    let orderByColumn = 'created_at';
    let ascending = false;
    if (sortBy === 'title.asc') {
      orderByColumn = 'title';
      ascending = true;
    } else if (sortBy === 'release_date.desc') {
      orderByColumn = 'release_date';
      ascending = false;
    } else if (sortBy === 'vote_average.desc') {
      orderByColumn = 'vote_average';
      ascending = false;
    } else if (sortBy === 'created_at.desc') {
      orderByColumn = 'created_at';
      ascending = false;
    }

    query = query.order(orderByColumn, { ascending: ascending });
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return new Response(JSON.stringify({
      results: data,
      total_results: count,
      total_pages: Math.ceil((count || 0) / limit),
      page: page
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})