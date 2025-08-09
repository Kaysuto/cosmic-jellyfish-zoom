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

// Helper to add a timeout to a promise
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Promise timed out after ${ms} ms`));
    }, ms);

    promise.then(
      (res) => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
};

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
      if (!service.url || service.status === 'maintenance') {
        return;
      }

      let check_status: 'up' | 'down' = 'up';
      let response_time_ms: number | null = null;

      try {
        const startTime = Date.now();
        
        if (service.ip_address && service.port) {
          const originalUrl = new URL(service.url);
          if (originalUrl.protocol === 'https:') {
            const connectPromise = Deno.connectTls({
              hostname: service.ip_address,
              port: service.port,
              serverName: originalUrl.hostname,
            });
            const conn = await withTimeout(connectPromise, 5000);
            conn.close();
          } else {
            const fetchUrl = `${originalUrl.protocol}//${service.ip_address}:${service.port}${originalUrl.pathname}${originalUrl.search}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(fetchUrl, {
              method: 'GET',
              headers: { 'Host': originalUrl.hostname },
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP status ${response.status}`);
          }
        } else {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const response = await fetch(service.url, { method: 'GET', signal: controller.signal });
          clearTimeout(timeoutId);
          if (!response.ok) throw new Error(`HTTP status ${response.status}`);
        }

        const endTime = Date.now();
        response_time_ms = endTime - startTime;
        check_status = 'up';

      } catch (e) {
        console.error(`Health check failed for service ${service.id} (${service.url}):`, e.message);
        check_status = 'down';
        response_time_ms = null;
      }

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