/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

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
        return; // Ignore les services sans URL
      }

      let status: 'operational' | 'downtime' = 'operational';
      let uptimePercentage = 100;

      try {
        const response = await fetch(service.url, { method: 'HEAD', redirect: 'follow' });
        if (!response.ok) {
          status = 'downtime';
          uptimePercentage = 0;
        }
      } catch (e) {
        console.error(`Error pinging ${service.url}:`, e.message);
        status = 'downtime';
        uptimePercentage = 0;
      }

      // Mettre à jour le statut du service
      await supabaseAdmin
        .from('services')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', service.id);

      // Insérer dans l'historique de disponibilité
      await supabaseAdmin
        .from('uptime_history')
        .insert({
          service_id: service.id,
          date: new Date().toISOString().split('T')[0],
          uptime_percentage: uptimePercentage
        });
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