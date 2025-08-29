/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

interface JellyfinSimpleAuthRequest {
  username: string;
  password: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { username, password }: JellyfinSimpleAuthRequest = await req.json().catch(() => ({}));

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

    // 1. Récupérer les paramètres Jellyfin
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('jellyfin_settings')
      .select('url, api_key')
      .eq('id', 1)
      .single();

    if (settingsError || !settings?.url || !settings?.api_key) {
      return new Response(JSON.stringify({ 
        error: 'Jellyfin settings not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Authentifier avec Jellyfin
    const authResponse = await fetch(`${settings.url}/Users/AuthenticateByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Token': settings.api_key,
      },
      body: JSON.stringify({
        Username: username,
        Pw: password
      })
    });

    if (!authResponse.ok) {
      return new Response(JSON.stringify({ 
        error: 'Invalid Jellyfin credentials' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authData = await authResponse.json();
    if (!authData.User) {
      return new Response(JSON.stringify({ 
        error: 'Jellyfin authentication failed' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Vérifier si l'utilisateur existe dans la base de données
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .or(`jellyfin_username.eq.${username},email.eq.${username}@jellyfin.local`)
      .single();

    let userProfile = null;
    let isNewUser = false;

    if (profile && !profileError) {
      userProfile = profile;
    } else {
      // 4. Si l'utilisateur n'existe pas, le créer automatiquement
      const email = `${username}@jellyfin.local`;
      
      // Créer l'utilisateur dans Supabase Auth avec le même mot de passe
      const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password, // Utiliser le même mot de passe que Jellyfin
        email_confirm: true,
        user_metadata: {
          first_name: authData.User.Name,
          last_name: '',
          jellyfin_user_id: authData.User.Id
        }
      });

      if (createError) {
        console.error('Erreur lors de la création de l\'utilisateur:', createError);
        return new Response(JSON.stringify({ 
          error: 'Erreur lors de la création du compte utilisateur',
          details: createError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Créer le profil dans la table profiles
      const { data: newProfile, error: profileCreateError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: authUser.user.id,
            email: email,
            first_name: authData.User.Name,
            last_name: '',
            jellyfin_user_id: authData.User.Id,
            jellyfin_username: username,
            role: 'user'
          }
        ])
        .select()
        .single();

      if (profileCreateError) {
        console.error('Erreur lors de la création du profil:', profileCreateError);
        // Supprimer l'utilisateur auth si le profil n'a pas pu être créé
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        
        return new Response(JSON.stringify({ 
          error: 'Erreur lors de la création du profil',
          details: profileCreateError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userProfile = newProfile;
      isNewUser = true;
    }

    // 5. Créer une session Supabase pour l'utilisateur
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: userProfile.id
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
      message: isNewUser ? 'Compte créé et authentification réussie' : 'Authentification réussie',
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.first_name,
        jellyfin_user_id: authData.User.Id,
        jellyfin_username: username,
        role: userProfile.role,
        is_new_user: isNewUser
      },
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at: sessionData.session.expires_at
      },
      jellyfin: {
        access_token: authData.AccessToken,
        user_id: authData.User.Id
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
