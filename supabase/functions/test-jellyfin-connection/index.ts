// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JELLYFIN_BASE_URL = Deno.env.get("JELLYFIN_BASE_URL");
const JELLYFIN_API_KEY = Deno.env.get("JELLYFIN_API_KEY");

serve(async (_req) => {
  if (_req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!JELLYFIN_BASE_URL || !JELLYFIN_API_KEY) {
    return new Response(
      JSON.stringify({ success: false, message: "L'URL ou la clé API de Jellyfin ne sont pas configurées dans les variables d'environnement." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  try {
    const url = `${JELLYFIN_BASE_URL}/System/Info?api_key=${JELLYFIN_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`L'API Jellyfin a retourné un statut non-2xx : ${response.status} ${response.statusText}`);
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
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});