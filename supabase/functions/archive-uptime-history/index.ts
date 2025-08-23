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

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // 1. Récupérer les anciennes données
    const { data: oldRecords, error: selectError } = await supabaseAdmin
      .from('uptime_history')
      .select('*')
      .lt('date', oneYearAgo.toISOString());

    if (selectError) throw selectError;
    if (!oldRecords || oldRecords.length === 0) {
      return new Response(JSON.stringify({ message: 'No old records to archive.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 2. Convertir en CSV
    const headers = Object.keys(oldRecords[0]).join(',');
    const rows = oldRecords.map(row => Object.values(row).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    // 3. Uploader vers le stockage
    const fileName = `uptime-archive-${new Date().toISOString().split('T')[0]}.csv`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('uptime-archives')
      .upload(fileName, csvContent, {
        contentType: 'text/csv',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 4. Supprimer les anciennes données
    const recordIds = oldRecords.map(r => r.id);
    const { error: deleteError } = await supabaseAdmin
      .from('uptime_history')
      .delete()
      .in('id', recordIds);

    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ message: `Successfully archived ${oldRecords.length} records.` }), {
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