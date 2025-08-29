/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

interface ImportJellyfinUserRequest {
  jellyfin_user_id: string;
  jellyfin_username: string;
  jellyfin_name: string;
  password: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    console.log('🔍 Début de import-jellyfin-users');
    
    const body = await req.json().catch((e) => {
      console.error('❌ Erreur parsing JSON:', e);
      return {};
    });
    
    console.log('📥 Données reçues:', JSON.stringify(body, null, 2));
    
    const { jellyfin_user_id, jellyfin_username, jellyfin_name, password }: ImportJellyfinUserRequest = body;

    // Validation des paramètres requis
    console.log('🔍 Validation des paramètres...');
    console.log('jellyfin_user_id:', jellyfin_user_id);
    console.log('jellyfin_username:', jellyfin_username);
    console.log('jellyfin_name:', jellyfin_name);
    console.log('password:', password ? '***' : 'undefined');
    
    if (!jellyfin_user_id || !jellyfin_username || !jellyfin_name || !password) {
      console.error('❌ Paramètres manquants:', { jellyfin_user_id, jellyfin_username, jellyfin_name, hasPassword: !!password });
      return new Response(JSON.stringify({ 
        error: 'jellyfin_user_id, jellyfin_username, jellyfin_name et password sont requis' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validation du mot de passe
    if (password.length < 6) {
      console.error('❌ Mot de passe trop court:', password.length);
      return new Response(JSON.stringify({ 
        error: 'Le mot de passe doit contenir au moins 6 caractères' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Utiliser le service role key pour créer l'utilisateur
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔧 Configuration Supabase:', { 
      url: supabaseUrl ? '✅' : '❌', 
      serviceRoleKey: serviceRoleKey ? '✅' : '❌' 
    });
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return new Response(JSON.stringify({ 
        error: 'Configuration Supabase manquante' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Vérifier si l'utilisateur existe déjà par jellyfin_user_id
    console.log('🔍 Vérification utilisateur existant par jellyfin_user_id:', jellyfin_user_id);
    
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('jellyfin_user_id', jellyfin_user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la vérification jellyfin_user_id:', checkError);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la vérification de l\'utilisateur existant',
        details: checkError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (existingUser) {
      console.log('⚠️ Utilisateur existant trouvé:', existingUser.email);
      return new Response(JSON.stringify({ 
        error: 'Un utilisateur avec cet ID Jellyfin existe déjà',
        existing_user: existingUser.email
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Générer l'email au format Jellyfin
    const email = `${jellyfin_username.replace(/[^a-zA-Z0-9]/g, '')}@jellyfin.local`;
    console.log('📧 Email généré:', email);

    // Vérifier si l'email existe déjà dans la table profiles
    console.log('🔍 Vérification email existant:', email);
    
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la vérification email:', profileCheckError);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la vérification de l\'email',
        details: profileCheckError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (existingProfile) {
      console.log('⚠️ Email existant trouvé:', existingProfile.email);
      return new Response(JSON.stringify({ 
        error: 'Un utilisateur avec cet email existe déjà' 
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extraire le prénom et nom de famille
    const nameParts = jellyfin_name.split(' ');
    const first_name = nameParts[0] || jellyfin_username;
    const last_name = nameParts.slice(1).join(' ') || '';
    
    console.log('👤 Informations utilisateur:', { first_name, last_name, email });

    // Créer l'utilisateur dans Supabase Auth
    console.log('🚀 Création de l\'utilisateur dans Supabase Auth...');
    
    try {
      const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Confirmer automatiquement l'email
        user_metadata: {
          first_name: first_name,
          last_name: last_name,
          jellyfin_user_id: jellyfin_user_id,
          jellyfin_username: jellyfin_username
        }
      });

      if (createError) {
        console.error('❌ Erreur lors de la création de l\'utilisateur:', createError);
        console.error('❌ Code d\'erreur:', createError.status);
        console.error('❌ Message d\'erreur:', createError.message);
        console.error('❌ Nom d\'erreur:', createError.name);
        
        return new Response(JSON.stringify({ 
          error: 'Erreur lors de la création de l\'utilisateur',
          details: createError.message,
          error_code: createError.status,
          error_name: createError.name
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('✅ Utilisateur Auth créé avec succès:', authUser.user.id);
      
      // Créer le profil dans la table profiles
      console.log('📝 Création du profil dans la table profiles...');
      
      const profileData = {
        id: authUser.user.id,
        email: email,
        first_name: first_name,
        last_name: last_name,
        jellyfin_user_id: jellyfin_user_id,
        jellyfin_username: jellyfin_username,
        role: 'user' // Rôle par défaut
      };
      
      console.log('📋 Données du profil:', profileData);
      
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.error('❌ Erreur lors de la création du profil:', profileError);
        // Supprimer l'utilisateur auth si le profil n'a pas pu être créé
        console.log('🗑️ Suppression de l\'utilisateur Auth en cas d\'erreur...');
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        
        return new Response(JSON.stringify({ 
          error: 'Erreur lors de la création du profil',
          details: profileError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('✅ Profil créé avec succès:', profile);

      console.log('🎉 Import Jellyfin terminé avec succès!');
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Utilisateur Jellyfin importé avec succès',
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          jellyfin_user_id: jellyfin_user_id,
          jellyfin_username: jellyfin_username,
          first_name: first_name,
          last_name: last_name,
          role: 'user'
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (authError) {
      console.error('💥 Erreur inattendue lors de la création Auth:', authError);
      return new Response(JSON.stringify({ 
        error: 'Erreur inattendue lors de la création de l\'utilisateur',
        details: authError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
    console.error('💥 Stack trace:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Erreur interne du serveur',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
