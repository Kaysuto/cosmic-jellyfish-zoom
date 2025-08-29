/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
// @ts-nocheck

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // Récupérer l'utilisateur depuis le token d'authentification
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Utiliser le client admin pour contourner les politiques RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier l'authentification avec le client admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Récupérer les notifications de l'utilisateur connecté
    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching notifications:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch notifications' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mapper les données pour correspondre à l'interface TypeScript
    const mappedNotifications = (notifications || []).map(notification => {
      const payload = notification.payload || {};
      
      return {
        id: notification.id,
        created_at: notification.created_at,
        notification_type: notification.type, // Mapper 'type' vers 'notification_type'
        media_tmdb_id: payload.tmdb_id || null,
        media_title: notification.title || payload.title || null,
        media_poster_path: payload.poster_path || null,
        is_read: notification.is_read,
        recipient_id: notification.recipient_id,
        media_type: payload.media_type || null,
        requester: payload.user_id ? {
          id: payload.user_id,
          first_name: payload.first_name || '',
          last_name: payload.last_name || '',
          email: payload.email || '',
          avatar_url: payload.avatar_url || null,
        } : undefined,
      };
    });

    return new Response(JSON.stringify(mappedNotifications), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('get-notifications unexpected error:', error);
    return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});