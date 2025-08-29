/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

interface UpdateJellyfinPasswordRequest {
  username: string;
  password: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { username, password }: UpdateJellyfinPasswordRequest = await req.json().catch(() => ({}));

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

    // 1. Authentifier avec Jellyfin pour vérifier les identifiants
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

    // Authentifier avec Jellyfin
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

    // 2. Trouver l'utilisateur dans la base de données
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, auth_user_id')
      .or(`jellyfin_username.eq.${username},email.eq.${username}@jellyfin.local`)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ 
        error: 'Utilisateur Jellyfin non trouvé dans la base de données' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Mettre à jour le mot de passe de l'utilisateur Supabase
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      { password: password }
    );

    if (updateError) {
      console.error('Erreur lors de la mise à jour du mot de passe:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la mise à jour du mot de passe' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Mot de passe mis à jour avec succès',
      user: {
        id: updateData.user.id,
        email: updateData.user.email,
        jellyfin_user_id: authData.User.Id
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
