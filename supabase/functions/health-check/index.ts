/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Service {
  id: string;
  url: string | null;
  status: string;
  ip_address: string | null;
  port: number | null;
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

    const { data: services, error: servicesError } = await supabaseAdmin
      .from('services')
      .select('id, url, status, ip_address, port');

    if (servicesError) throw servicesError;

    const checks = services.map(async (service: Service) => {
      // Ne pas vérifier les services en maintenance
      if (!service.url || service.status === 'maintenance') {
        return;
      }

      let check_status: 'up' | 'down' = 'up';
      let response_time_ms: number | null = null;

      let fetchUrl = service.url;
      const fetchOptions: RequestInit = {
          method: 'GET',
          redirect: 'follow',
      };

      // If IP and port are provided, use them for a direct check
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
        console.error(`Error pinging ${fetchUrl} (for ${service.url}):`, e.message);
        check_status = 'down';
        response_time_ms = null;
      }

      // Insérer uniquement le résultat. Le trigger s'occupera du reste.
      const { error: insertError } = await supabaseAdmin
        .from('health_check_results')
        .insert({
          service_id: service.id,
          status: check_status,
          response_time_ms: response_time_ms
        });

      if (insertError) {
        console.error(`Error inserting health check for service ${service.id}:`, insertError.message);
      }
    });

    await Promise.all(checks);

    return new Response(JSON.stringify({ message: 'Health checks completed.' }), {
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