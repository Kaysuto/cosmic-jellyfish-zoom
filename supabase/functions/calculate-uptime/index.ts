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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get all services
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
      // 2. Calculate yesterday's uptime and avg response time from health checks
      const { data: checks, error: checksError } = await supabaseAdmin
        .from('health_check_results')
        .select('status, response_time_ms')
        .eq('service_id', service.id)
        .gte('created_at', yesterdayStart.toISOString())
        .lte('created_at', yesterdayEnd.toISOString());

      if (checksError) {
        console.error(`Error fetching checks for service ${service.id}:`, checksError.message);
        continue;
      }

      if (checks && checks.length > 0) {
        const upChecks = checks.filter(c => c.status === 'up');
        const upCount = upChecks.length;
        const totalCount = checks.length;
        const uptimePercentage = (upCount / totalCount) * 100;

        const totalResponseTime = upChecks.reduce((sum, check) => sum + (check.response_time_ms || 0), 0);
        const avgResponseTime = upCount > 0 ? Math.round(totalResponseTime / upCount) : null;

        // 3. Save yesterday's uptime and avg response time to history
        const { error: upsertError } = await supabaseAdmin
          .from('uptime_history')
          .upsert({
            service_id: service.id,
            date: yesterdayDateString,
            uptime_percentage: uptimePercentage,
            avg_response_time_ms: avgResponseTime,
          }, {
            onConflict: 'service_id,date'
          });

        if (upsertError) {
          console.error(`Error upserting uptime for service ${service.id}:`, upsertError.message);
        }
      }

      // 4. Calculate and update the 90-day rolling uptime average on the service itself
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: recentUptime, error: avgError } = await supabaseAdmin
        .from('uptime_history')
        .select('uptime_percentage')
        .eq('service_id', service.id)
        .gte('date', ninetyDaysAgo.toISOString().split('T')[0]);

      if (avgError) {
        console.error(`Error fetching recent uptime for service ${service.id}:`, avgError.message);
      } else if (recentUptime && recentUptime.length > 0) {
        const totalUptime = recentUptime.reduce((sum, record) => sum + record.uptime_percentage, 0);
        const averageUptime = totalUptime / recentUptime.length;

        const { error: updateServiceError } = await supabaseAdmin
          .from('services')
          .update({ uptime_percentage: averageUptime, updated_at: new Date().toISOString() })
          .eq('id', service.id);

        if (updateServiceError) {
          console.error(`Error updating service uptime for ${service.id}:`, updateServiceError.message);
        }
      }
    }
    
    // 5. Clean up old health check results (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const { error: deleteError } = await supabaseAdmin
      .from('health_check_results')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (deleteError) {
        console.error(`Error cleaning up old health checks:`, deleteError.message);
    }

    return new Response(JSON.stringify({ message: 'Uptime calculation and service update completed.' }), {
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