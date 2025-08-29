/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

interface SyncPasswordRequest {
  jellyfin_user_id: string;
  email: string;
  password: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { jellyfin_user_id, email, password }: SyncPasswordRequest = await req.json().catch(() => ({}));

    // Validation des paramètres requis
    if (!jellyfin_user_id || !email || !password) {
      return new Response(JSON.stringify({ 
        error: 'jellyfin_user_id, email et password sont requis' 
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

    // 1. Vérifier que l'utilisateur existe dans la base de données
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

    // 2. Vérifier que l'utilisateur existe dans Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id);

    if (authError || !authUser.user) {
      return new Response(JSON.stringify({ 
        error: 'Utilisateur non trouvé dans Supabase Auth' 
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
        error: 'Erreur lors de la mise à jour du mot de passe',
        details: updateError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Mot de passe synchronisé avec succès',
      user: {
        id: updateData.user.id,
        email: updateData.user.email,
        jellyfin_user_id: jellyfin_user_id
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
