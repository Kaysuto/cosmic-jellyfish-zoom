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
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { service_id } = await req.json();
    if (!service_id) {
      throw new Error("service_id is required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('id, url, status, ip_address, port')
      .eq('id', service_id)
      .single();

    if (serviceError) throw serviceError;
    
    if (!service.url || service.status === 'maintenance') {
      return new Response(JSON.stringify({ message: 'Service has no URL to check or is in maintenance.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    let check_status: 'up' | 'down' = 'up';
    let response_time_ms: number | null = null;
    
    let fetchUrl = service.url;
    const fetchOptions: RequestInit = {
        method: 'GET',
        redirect: 'follow',
    };

    if (service.ip_address && service.port) {
        const originalUrl = new URL(service.url);
        fetchUrl = `${originalUrl.protocol}//${service.ip_address}:${service.port}${originalUrl.pathname}${originalUrl.search}`;
        fetchOptions.headers = { 'Host': originalUrl.hostname };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      fetchOptions.signal = controller.signal;
      
      const startTime = Date.now();
      const response = await fetch(fetchUrl, fetchOptions);
      const endTime = Date.now();
      
      clearTimeout(timeoutId);
      response_time_ms = endTime - startTime;

      if (!response.ok || response.type === 'error') {
        check_status = 'down';
      }
    } catch (e) {
      console.error(`Immediate check error for ${fetchUrl} (for ${service.url}):`, e.message);
      check_status = 'down';
      response_time_ms = null;
    }

    // Insérer le résultat. Le trigger fera le reste.
    const { error: insertError } = await supabaseAdmin
      .from('health_check_results')
      .insert({
        service_id: service.id,
        status: check_status,
        response_time_ms: response_time_ms
      });

    if (insertError) {
      console.error(`Error inserting health check for service ${service.id}:`, insertError.message);
      throw insertError;
    }

    return new Response(JSON.stringify({ message: `Service ${service_id} check initiated.` }), {
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