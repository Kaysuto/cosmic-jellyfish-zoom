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
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password, first_name, last_name, role } = await req.json()
    if (!email || !password || !first_name || !last_name || !role) {
      throw new Error("All fields are required: email, password, first_name, last_name, role");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // L'utilisateur devra confirmer son email
      user_metadata: {
        first_name,
        last_name,
      }
    })

    if (authError) throw authError;
    if (!user) throw new Error("User creation failed in Auth.");

    // 2. Le trigger `handle_new_user` a déjà créé un profil.
    //    Nous mettons à jour le rôle de ce profil.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', user.id);

    if (profileError) {
      // Si la mise à jour du profil échoue, nous devrions idéalement supprimer l'utilisateur créé
      // pour éviter un état incohérent.
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      throw profileError;
    }

    return new Response(JSON.stringify({ message: `User ${email} created successfully.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})