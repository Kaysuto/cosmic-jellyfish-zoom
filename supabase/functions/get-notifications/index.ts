/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
// @ts-nocheck

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Payload = {
  tmdb_id?: number;
  media_tmdb_id?: number;
  title?: string;
  media_title?: string;
  poster_path?: string;
  media_poster_path?: string;
  media_type?: string;
  user_id?: string;
};

type NotificationRow = {
  id: string;
  created_at: string;
  type: string;
  payload?: Payload | undefined;
  title?: string | null;
  is_read?: boolean;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from Authorization header (more secure)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("id, created_at, type, payload, title, is_read")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    const raw = (data || []).map((n: NotificationRow) => {
      let media_tmdb_id: number | null = null;
      let media_title: string | null = n.title ?? null;
      let media_poster_path: string | null = null;
      let media_type: string | null = null;
      let requester_user_id: string | null = null;
      
      if (n.payload) {
        try {
          const p = typeof n.payload === "string"
            ? (JSON.parse(n.payload as string) as Payload)
            : (n.payload as Payload);
          media_tmdb_id = p.tmdb_id ?? p.media_tmdb_id ?? null;
          media_title = media_title ?? p.title ?? p.media_title ?? null;
          media_poster_path = p.poster_path ?? p.media_poster_path ?? null;
          media_type = p.media_type ?? null;
          requester_user_id = p.user_id ?? null;
          

        } catch {
          // ignore if payload is not valid JSON
        }
      }

      return {
        id: n.id,
        created_at: n.created_at,
        notification_type: n.type || "unknown",
        media_tmdb_id,
        media_title,
        media_poster_path,
        is_read: !!n.is_read,
        media_type,
        requester_user_id,
      };
    });

    // Enrich with requester profiles (batch)
    const uniqueRequesterIds = Array.from(new Set(raw.map(r => r.requester_user_id).filter(Boolean))) as string[];
    let requesterMap = new Map<string, any>();
    if (uniqueRequesterIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .in('id', uniqueRequesterIds);
      if (profiles) {
        requesterMap = new Map(profiles.map(p => [p.id, p]));
      }
    }

    const formatted = raw.map(n => {
      const p = n.requester_user_id ? requesterMap.get(n.requester_user_id) : null;
      return {
        ...n,
        requester: p ? {
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          avatar_url: p.avatar_url,
        } : null,
      };
    });

    return new Response(JSON.stringify(formatted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message ?? String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});