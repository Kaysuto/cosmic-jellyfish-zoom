import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { record } = await req.json();

    // Check if the required fields exist in the record
    if (!record.id || !record.title || !record.tmdb_id || !record.media_type || !record.user_id || !record.poster_path) {
      throw new Error("Missing required fields in the record");
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({
        type: 'media_request',
        title: `Nouvelle demande: ${record.title || record.tmdb_id}`,
        payload: {
          request_id: record.id,
          tmdb_id: record.tmdb_id,
          media_type: record.media_type,
          user_id: record.user_id,
          requested_at: record.requested_at,
          poster_path: record.poster_path,
        },
        target_role: 'admin',
        is_read: false,
      });

    if (error) {
      throw new Error(`Failed to insert notification: ${error.message}`);
    }

    return new Response(JSON.stringify({ message: 'Notification created successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});