/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { userId, enable } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'userId est requis' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (typeof enable !== 'boolean') {
      return new Response(JSON.stringify({ 
        error: 'enable doit être un booléen' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (enable) {
      // Activer le MFA - on ne peut pas forcer l'activation, l'utilisateur doit le faire lui-même
      // On peut seulement vérifier s'il a déjà des facteurs MFA
      const { data: factors, error: factorsError } = await supabaseAdmin.auth.admin.listMfaFactors(userId);
      
      if (factorsError) {
        return new Response(JSON.stringify({ 
          error: 'Erreur lors de la vérification des facteurs MFA',
          details: factorsError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (factors.totp.length === 0) {
        return new Response(JSON.stringify({ 
          error: 'Impossible d\'activer le MFA',
          details: 'L\'utilisateur n\'a pas encore configuré de facteurs MFA. Il doit d\'abord configurer son MFA depuis son profil.'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Mettre à jour le profil pour indiquer que le MFA est activé
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ has_mfa: true })
        .eq('id', userId);

      if (profileError) {
        return new Response(JSON.stringify({ 
          error: 'Erreur lors de la mise à jour du profil',
          details: profileError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: 'MFA activé avec succès'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      // Désactiver le MFA - supprimer tous les facteurs MFA
      const { data: factors, error: factorsError } = await supabaseAdmin.auth.admin.listMfaFactors(userId);
      
      if (factorsError) {
        return new Response(JSON.stringify({ 
          error: 'Erreur lors de la récupération des facteurs MFA',
          details: factorsError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Supprimer tous les facteurs TOTP
      for (const factor of factors.totp) {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteMfaFactor(userId, factor.id);
        if (deleteError) {
          console.error(`Erreur lors de la suppression du facteur ${factor.id}:`, deleteError);
        }
      }

      // Mettre à jour le profil pour indiquer que le MFA est désactivé
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ has_mfa: false })
        .eq('id', userId);

      if (profileError) {
        return new Response(JSON.stringify({ 
          error: 'Erreur lors de la mise à jour du profil',
          details: profileError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: 'MFA désactivé avec succès',
        factorsRemoved: factors.totp.length
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Erreur inattendue:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur interne du serveur',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
