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
    const body = await req.json().catch(() => ({}));
    const { email, password, first_name, last_name, role } = body || {};

    // Basic validation
    if (!email || !password || !first_name || !last_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields: email, password, first_name, last_name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create the user via admin API. We add user metadata so DB trigger can create profile with role / names.
    const createPayload: any = {
      email,
      password,
      user_metadata: {
        first_name,
        last_name,
      },
      // raw_user_meta_data is sometimes used by triggers — include role there to be safe
      raw_user_meta_data: {
        role: role || 'user',
        first_name,
        last_name,
      },
      // Confirm email automatically to allow immediate access
      email_confirm: true,
      // Also set email_confirmed_at to ensure the user is considered confirmed
      email_confirmed_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.auth.admin.createUser(createPayload);

    if (error) {
      console.error('create-user error:', error);
      return new Response(JSON.stringify({ error: error.message || 'Failed to create user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return created user id (the profiles trigger will handle profile creation)
    return new Response(JSON.stringify({ message: 'User created', user: { id: data?.user?.id ?? null, email: data?.user?.email ?? null } }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('create-user unexpected error:', error);
    return new Response(JSON.stringify({ error: error?.message ?? String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});