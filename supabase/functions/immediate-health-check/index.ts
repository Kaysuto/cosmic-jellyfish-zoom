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

    // Get the service details
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('id, url')
      .eq('id', service_id)
      .single();

    if (serviceError) throw serviceError;
    if (!service || !service.url) {
      // If no URL, it's considered in maintenance, no need to check
      return new Response(JSON.stringify({ message: 'Service has no URL to check.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    let live_status: 'operational' | 'downtime' = 'operational';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(service.url, { 
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);

      if (!response.ok || response.type === 'error') {
        live_status = 'downtime';
      }
    } catch (e) {
      console.error(`Immediate check error for ${service.url}:`, e.message);
      live_status = 'downtime';
    }

    // Update the live status of the service
    const { error: updateError } = await supabaseAdmin
      .from('services')
      .update({ status: live_status, updated_at: new Date().toISOString() })
      .eq('id', service.id);
    
    if (updateError) {
      console.error(`Error updating service ${service.id}:`, updateError.message);
      throw updateError;
    }

    return new Response(JSON.stringify({ message: `Service ${service_id} checked. Status: ${live_status}` }), {
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