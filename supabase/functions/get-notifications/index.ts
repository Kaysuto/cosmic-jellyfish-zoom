/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

type Payload = {
  tmdb_id?: number;
  media_tmdb_id?: number;
  title?: string;
  media_title?: string;
  poster_path?: string;
  media_poster_path?: string;
};

type NotificationRow = {
  id: string;
  created_at: string;
  type?: string;
  notification_type?: string;
  payload?: Payload | undefined;
  title?: string | null;
  is_read?: boolean;
  recipient_id?: string | null;
  target_role?: string | null;
};

serve(async (req) => {
  // Reply to OPTIONS preflight quickly with proper CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId;

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required in request body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server misconfigured: missing SUPABASE env vars" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("id, created_at, type as notification_type, payload, title, is_read, recipient_id, target_role")
      .or(`recipient_id.eq.${userId},target_role.eq.user`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    // Map payload/title into expected shape for frontend
    const formatted = (data || []).map((n: NotificationRow) => {
      // Try to extract fields if stored in payload
      let media_tmdb_id: number | null = null;
      let media_title: string | null = n.title ?? null;
      let media_poster_path: string | null = null;
      if (n.payload) {
        try {
          const p = typeof n.payload === "string"
            ? (JSON.parse(n.payload as string) as Payload)
            : (n.payload as Payload);
          media_tmdb_id = p.tmdb_id ?? p.media_tmdb_id ?? null;
          media_title = media_title ?? p.title ?? p.media_title ?? null;
          media_poster_path = p.poster_path ?? p.media_poster_path ?? null;
        } catch {
          // ignore
        }
      }

      return {
        id: n.id,
        created_at: n.created_at,
        notification_type: n.type || n.notification_type || "unknown",
        media_tmdb_id,
        media_title,
        media_poster_path,
        is_read: !!n.is_read,
      };
    });

    return new Response(JSON.stringify(formatted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message ?? String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});