/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

interface UpdateEmailRequest {
  userId: string;
  newEmail: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { userId, newEmail }: UpdateEmailRequest = await req.json().catch(() => ({}));

    // Validation des paramètres requis
    if (!userId || !newEmail) {
      return new Response(JSON.stringify({ 
        error: 'userId et newEmail sont requis' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return new Response(JSON.stringify({ 
        error: 'Format d\'email invalide' 
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

    // Vérifier si l'utilisateur existe
    const { data: existingUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !existingUser.user) {
      return new Response(JSON.stringify({ 
        error: 'Utilisateur non trouvé' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Vérifier si le nouvel email n'est pas déjà utilisé
    const { data: usersWithEmail, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (checkError) {
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la vérification de l\'email' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailAlreadyExists = usersWithEmail.users.some(u => 
      u.email === newEmail && u.id !== userId
    );

    if (emailAlreadyExists) {
      return new Response(JSON.stringify({ 
        error: 'Cette adresse email est déjà utilisée par un autre compte' 
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mettre à jour l'email dans Supabase Auth
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        email: newEmail,
        email_confirm: true // Confirmer automatiquement le nouvel email
      }
    );

    if (updateError) {
      console.error('Erreur lors de la mise à jour de l\'email:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la mise à jour de l\'email',
        details: updateError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mettre à jour l'email dans la table profiles
    const { data: profileUpdate, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ email: newEmail })
      .eq('id', userId)
      .select()
      .single();

    if (profileError) {
      console.error('Erreur lors de la mise à jour du profil:', profileError);
      // On ne fait pas échouer la requête car l'email Auth a été mis à jour
      console.warn('Email Auth mis à jour mais profil non mis à jour:', profileError.message);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email mis à jour avec succès',
      user: {
        id: updateData.user.id,
        email: updateData.user.email,
        email_confirmed_at: updateData.user.email_confirmed_at
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
