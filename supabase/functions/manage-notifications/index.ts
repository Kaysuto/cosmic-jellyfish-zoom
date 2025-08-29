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

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, notificationId, notificationIds } = await req.json();

    if (!action) {
      return new Response(JSON.stringify({ error: 'Action is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result;

    switch (action) {
      case 'mark_as_read':
        if (!notificationId) {
          return new Response(JSON.stringify({ error: 'Notification ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        result = await supabaseAdmin
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId)
          .eq('recipient_id', user.id);

        if (result.error) {
          console.error('Error marking notification as read:', result.error);
          return new Response(JSON.stringify({ error: 'Failed to mark notification as read' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, message: 'Notification marked as read' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'mark_all_as_read':
        if (!notificationIds || !Array.isArray(notificationIds)) {
          return new Response(JSON.stringify({ error: 'Notification IDs array is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        result = await supabaseAdmin
          .from('notifications')
          .update({ is_read: true })
          .in('id', notificationIds)
          .eq('recipient_id', user.id);

        if (result.error) {
          console.error('Error marking all notifications as read:', result.error);
          return new Response(JSON.stringify({ error: 'Failed to mark all notifications as read' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, message: 'All notifications marked as read' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'delete':
        if (!notificationId) {
          return new Response(JSON.stringify({ error: 'Notification ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        result = await supabaseAdmin
          .from('notifications')
          .delete()
          .eq('id', notificationId)
          .eq('recipient_id', user.id);

        if (result.error) {
          console.error('Error deleting notification:', result.error);
          return new Response(JSON.stringify({ error: 'Failed to delete notification' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, message: 'Notification deleted' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'clear_all':
        result = await supabaseAdmin
          .from('notifications')
          .delete()
          .eq('recipient_id', user.id);

        if (result.error) {
          console.error('Error clearing all notifications:', result.error);
          return new Response(JSON.stringify({ error: 'Failed to clear all notifications' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, message: 'All notifications cleared' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('manage-notifications unexpected error:', error);
    return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
