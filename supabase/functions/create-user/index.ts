/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
// @ts-nocheck

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password, first_name, last_name, role } = await req.json()
    if (!email || !password || !first_name || !last_name || !role) {
      throw new Error("All fields are required: email, password, first_name, last_name, role");
    }

    const supabaseAdmin: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Créer l'utilisateur dans Supabase Auth, en passant toutes les informations nécessaires dans les métadonnées
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirme l'utilisateur automatiquement
      user_metadata: {
        first_name,
        last_name,
        role, // Passer le rôle ici
      }
    })

    if (authError) {
      console.error('Error during user creation in Auth:', authError.message);
      throw authError;
    }
    if (!user) {
      console.error('User object was null after creation attempt.');
      throw new Error("User creation failed in Auth.");
    }

    // Le déclencheur de base de données 'handle_new_user' créera maintenant le profil.
    // Il n'est plus nécessaire d'insérer dans la table 'profiles' depuis cette fonction.

    return new Response(JSON.stringify({ message: `User ${email} created successfully.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Caught error in create-user function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})