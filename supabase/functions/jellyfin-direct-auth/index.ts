/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

interface JellyfinDirectAuthRequest {
  username: string;
  password: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { username, password }: JellyfinDirectAuthRequest = await req.json().catch(() => ({}));

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
    let userExists = false;

    if (profile && !profileError) {
      userProfile = profile;
      userExists = true;
    } else {
      // 4. Si l'utilisateur n'existe pas, retourner une erreur spécifique
      return new Response(JSON.stringify({ 
        error: 'User not found in application. Please create account first.',
        jellyfin_user: {
          Id: authData.User.Id,
          Name: authData.User.Name,
          Email: authData.User.Email
        }
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Créer une session JWT personnalisée
    const sessionToken = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userProfile.email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/callback`
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Authentification Jellyfin réussie',
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.first_name,
        jellyfin_user_id: authData.User.Id,
        jellyfin_username: username,
        role: userProfile.role,
        session_token: sessionToken.properties.action_link
      },
      auth: {
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
