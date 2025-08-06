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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: services, error: servicesError } = await supabaseAdmin
      .from('services')
      .select('id');
    if (servicesError) throw servicesError;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDateString = yesterday.toISOString().split('T')[0];

    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setUTCHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setUTCHours(23, 59, 59, 999);

    for (const service of services) {
      const { data: checks, error: checksError } = await supabaseAdmin
        .from('health_check_results')
        .select('status', { count: 'exact' })
        .eq('service_id', service.id)
        .gte('created_at', yesterdayStart.toISOString())
        .lte('created_at', yesterdayEnd.toISOString());

      if (checksError) {
        console.error(`Error fetching checks for service ${service.id}:`, checksError.message);
        continue;
      }

      if (!checks || checks.length === 0) {
        console.log(`No checks found for service ${service.id} for date ${yesterdayDateString}. Skipping.`);
        continue;
      }

      const upCount = checks.filter(c => c.status === 'up').length;
      const totalCount = checks.length;
      const uptimePercentage = (upCount / totalCount) * 100;

      const { error: upsertError } = await supabaseAdmin
        .from('uptime_history')
        .upsert({
          service_id: service.id,
          date: yesterdayDateString,
          uptime_percentage: uptimePercentage,
        }, {
          onConflict: 'service_id,date'
        });

      if (upsertError) {
        console.error(`Error upserting uptime for service ${service.id}:`, upsertError.message);
      }
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const { error: deleteError } = await supabaseAdmin
      .from('health_check_results')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (deleteError) {
        console.error(`Error cleaning up old health checks:`, deleteError.message);
    }

    return new Response(JSON.stringify({ message: 'Uptime calculation completed.' }), {
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