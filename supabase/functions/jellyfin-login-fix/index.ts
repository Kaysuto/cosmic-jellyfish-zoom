/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

interface JellyfinLoginFixRequest {
  username: string;
  password: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { username, password }: JellyfinLoginFixRequest = await req.json().catch(() => ({}));

    // Validation des paramètres requis
    if (!username || !password) {
      return new Response(JSON.stringify({ 
        error: 'username et password sont requis' 
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

    // 1. Utiliser la fonction jellyfin-login existante
    const { data: jellyfinData, error: jellyfinError } = await supabaseAdmin.functions.invoke('jellyfin-login', {
      body: {
        username: username,
        password: password
      }
    });

    if (jellyfinError) {
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de l\'authentification Jellyfin',
        details: jellyfinError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (jellyfinData.error) {
      return new Response(JSON.stringify({ 
        error: jellyfinData.error
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Vérifier que l'utilisateur existe dans la base de données
    if (!jellyfinData.user.userExists || !jellyfinData.user.authUserId) {
      return new Response(JSON.stringify({ 
        error: 'Utilisateur Jellyfin non trouvé dans la base de données. Veuillez contacter l\'administrateur.' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Mettre à jour le mot de passe de l'utilisateur Supabase
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      jellyfinData.user.authUserId,
      { password: password }
    );

    if (updateError) {
      console.error('Erreur lors de la mise à jour du mot de passe:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la mise à jour du mot de passe',
        details: updateError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Créer une session pour l'utilisateur
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: jellyfinData.user.authUserId
    });

    if (sessionError) {
      console.error('Erreur lors de la création de la session:', sessionError);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la création de la session',
        details: sessionError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Authentification réussie et mot de passe synchronisé',
      user: {
        id: jellyfinData.user.authUserId,
        email: jellyfinData.user.email,
        name: jellyfinData.user.Name,
        jellyfin_user_id: jellyfinData.user.Id,
        jellyfin_username: username
      },
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at
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
