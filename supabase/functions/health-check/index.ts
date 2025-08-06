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
      .select('id, url');

    if (servicesError) throw servicesError;

    const checks = services.map(async (service: Service) => {
      if (!service.url) {
        return; // Ignore services without a URL
      }

      let live_status: 'operational' | 'downtime' = 'operational';
      let check_status: 'up' | 'down' = 'up';
      let response_time_ms: number | null = null;

      try {
        // Use a timeout for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const startTime = Date.now();
        const response = await fetch(service.url, { 
          method: 'GET', // Changed from HEAD to GET for better compatibility
          redirect: 'follow',
          signal: controller.signal 
        });
        const endTime = Date.now();
        
        clearTimeout(timeoutId);
        response_time_ms = endTime - startTime;

        if (!response.ok) {
          live_status = 'downtime';
          check_status = 'down';
        }
      } catch (e) {
        console.error(`Error pinging ${service.url}:`, e.message);
        live_status = 'downtime';
        check_status = 'down';
        response_time_ms = null;
      }

      // 1. Update the live status of the service
      const { error: updateError } = await supabaseAdmin
        .from('services')
        .update({ status: live_status, updated_at: new Date().toISOString() })
        .eq('id', service.id);
      
      if (updateError) {
        console.error(`Error updating service ${service.id}:`, updateError.message);
      }

      // 2. Insert a record into the health check history
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