/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

interface CreateUserRequest {
  jellyfin_user_id: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { jellyfin_user_id, email, password, first_name, last_name }: CreateUserRequest = await req.json().catch(() => ({}));

    // Validation des paramètres requis
    if (!jellyfin_user_id || !email || !password) {
      return new Response(JSON.stringify({ 
        error: 'jellyfin_user_id, email et password sont requis' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Utiliser le service role key pour créer l'utilisateur
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('jellyfin_user_id', jellyfin_user_id)
      .single();

    if (existingUser) {
      return new Response(JSON.stringify({ 
        error: 'Un utilisateur avec cet ID Jellyfin existe déjà',
        existing_user: existingUser.email
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Vérifier si l'email existe déjà
    const { data: existingEmail, error: emailCheckError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (emailCheckError) {
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la vérification de l\'email' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userWithEmail = existingEmail.users.find(u => u.email === email);
    if (userWithEmail) {
      return new Response(JSON.stringify({ 
        error: 'Un utilisateur avec cet email existe déjà' 
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Créer l'utilisateur dans Supabase Auth
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confirmer automatiquement l'email
      user_metadata: {
        first_name: first_name || '',
        last_name: last_name || '',
        jellyfin_user_id: jellyfin_user_id
      }
    });

    if (createError) {
      console.error('Erreur lors de la création de l\'utilisateur:', createError);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la création de l\'utilisateur',
        details: createError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Créer le profil dans la table profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: authUser.user.id,
          email: email,
          first_name: first_name || '',
          last_name: last_name || '',
          jellyfin_user_id: jellyfin_user_id,
          role: 'user' // Rôle par défaut
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Erreur lors de la création du profil:', profileError);
      // Supprimer l'utilisateur auth si le profil n'a pas pu être créé
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la création du profil',
        details: profileError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Compte utilisateur créé avec succès',
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        jellyfin_user_id: jellyfin_user_id,
        first_name: first_name || '',
        last_name: last_name || '',
        role: 'user'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur inattendue:', error);
    return new Response(JSON.stringify({ error: 'Erreur interne du serveur' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
