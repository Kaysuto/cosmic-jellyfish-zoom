/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

interface JellyfinSignInRequest {
  jellyfin_user_id: string;
  password: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { jellyfin_user_id, password }: JellyfinSignInRequest = await req.json().catch(() => ({}));

    // Validation des paramètres requis
    if (!jellyfin_user_id || !password) {
      return new Response(JSON.stringify({ 
        error: 'jellyfin_user_id et password sont requis' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Utiliser le service role key pour accéder à la base de données
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Trouver l'utilisateur par jellyfin_user_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, auth_user_id')
      .eq('jellyfin_user_id', jellyfin_user_id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ 
        error: 'Utilisateur Jellyfin non trouvé dans la base de données' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!profile.auth_user_id) {
      return new Response(JSON.stringify({ 
        error: 'Compte utilisateur non lié à un compte Supabase Auth' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Récupérer les informations utilisateur
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.auth_user_id);

    if (userError) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la récupération de l\'utilisateur' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Retourner les informations pour la connexion côté client
    // au lieu de créer une session côté serveur
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Authentification Jellyfin réussie - Prêt pour connexion',
      user: {
        id: userData.user.id,
        email: userData.user.email,
        jellyfin_user_id: jellyfin_user_id
      },
      // Retourner les informations pour la connexion côté client
      loginInfo: {
        email: profile.email,
        password: password
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
