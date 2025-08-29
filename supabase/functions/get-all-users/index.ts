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
    // Récupérer les variables d'environnement avec fallback
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://tgffkwoekuaetahrwioo.supabase.co';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!serviceRoleKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY non définie');
      return new Response(JSON.stringify({ 
        error: 'Configuration manquante: SUPABASE_SERVICE_ROLE_KEY non définie',
        details: 'La clé de service Supabase n\'est pas configurée dans les variables d\'environnement'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🔧 Création du client Supabase avec service role...');
    
    // Utiliser le service role key pour contourner RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    console.log('📊 Récupération des utilisateurs...');
    
    // Récupérer tous les utilisateurs - utiliser id au lieu de created_at
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de la récupération des utilisateurs',
        details: error.message,
        code: error.code
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`✅ ${users?.length || 0} utilisateurs récupérés avec succès`);

    // Récupérer les informations MFA pour chaque utilisateur
    console.log('🔐 Récupération des informations MFA...');
    const { data: mfaFactors, error: mfaError } = await supabaseAdmin.rpc('get_all_mfa_user_ids');
    
    if (mfaError) {
      console.error('⚠️ Erreur lors de la récupération des facteurs MFA:', mfaError);
    }

    const usersWithMfa = users?.map(user => {
      const hasMfa = mfaFactors?.some(factor => factor.user_id === user.id);
      return {
        ...user,
        has_mfa: hasMfa || false
      };
    }) || [];

    console.log(`✅ ${usersWithMfa.length} utilisateurs avec informations MFA`);

    return new Response(JSON.stringify({ 
      users: usersWithMfa,
      count: usersWithMfa.length,
      success: true
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur interne du serveur',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
