/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { url, api_key } = await req.json().catch(() => ({}));

    // Utiliser le service role key pour contourner RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier si l'enregistrement existe déjà
    const { data: existingSettings, error: checkError } = await supabaseAdmin
      .from('jellyfin_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification:', checkError);
      return new Response(JSON.stringify({ error: 'Erreur lors de la vérification des paramètres' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result;
    if (existingSettings) {
      // Mettre à jour l'enregistrement existant
      const { data, error } = await supabaseAdmin
        .from('jellyfin_settings')
        .update({ 
          url: url || existingSettings.url, 
          api_key: api_key || existingSettings.api_key,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        return new Response(JSON.stringify({ error: 'Erreur lors de la mise à jour des paramètres' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      result = data;
    } else {
      // Créer un nouvel enregistrement
      const { data, error } = await supabaseAdmin
        .from('jellyfin_settings')
        .insert([
          {
            id: 1,
            url: url || '',
            api_key: api_key || '',
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création:', error);
        return new Response(JSON.stringify({ error: 'Erreur lors de la création des paramètres' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      result = data;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Paramètres Jellyfin configurés avec succès',
      settings: {
        id: result.id,
        url: result.url,
        api_key: result.api_key ? '***configuré***' : 'non configuré',
        created_at: result.created_at,
        updated_at: result.updated_at
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
