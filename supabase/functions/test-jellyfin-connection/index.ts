// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (_req) => {
  if (_req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('jellyfin_settings')
      .select('url, api_key')
      .eq('id', 1)
      .single();

    if (settingsError || !settings || !settings.url || !settings.api_key) {
      return new Response(
        JSON.stringify({ success: false, message: "Veuillez configurer l'URL et la clé API de Jellyfin dans les paramètres d'administration." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const JELLYFIN_BASE_URL = settings.url;
    const JELLYFIN_API_KEY = settings.api_key;

    const url = `${JELLYFIN_BASE_URL}/System/Info?api_key=${JELLYFIN_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, message: `L'API Jellyfin a retourné une erreur : ${response.status} ${response.statusText}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Connexion réussie !",
        data: {
          serverName: data.ServerName,
          version: data.Version,
          operatingSystem: data.OperatingSystem,
          baseUrl: JELLYFIN_BASE_URL,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du test de la connexion Jellyfin:", error.message);
    return new Response(
      JSON.stringify({ success: false, message: `Erreur de réseau ou de configuration : ${error.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});