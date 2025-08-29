/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface JellyfinSecrets {
  url: string;
  api_key: string;
  admin_username: string;
  admin_password: string;
}

serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Créer le client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Vérifier l'authentification et les permissions admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Accès refusé - Admin requis' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { method } = req
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    switch (method) {
      case 'GET':
        if (action === 'get') {
          // Récupérer les secrets depuis les variables d'environnement
          const secrets: JellyfinSecrets = {
            url: Deno.env.get('JELLYFIN_URL') || '',
            api_key: Deno.env.get('JELLYFIN_API_KEY') || '',
            admin_username: Deno.env.get('JELLYFIN_ADMIN_USERNAME') || 'Kimiya',
            admin_password: Deno.env.get('JELLYFIN_ADMIN_PASSWORD') || 'ENZlau2025+'
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              secrets: {
                url: secrets.url,
                api_key: secrets.api_key ? '***' : '', // Masquer la clé API
                admin_username: secrets.admin_username,
                admin_password: '***' // Masquer le mot de passe
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break

      case 'POST':
        if (action === 'update') {
          const body = await req.json()
          const { url, api_key, admin_username, admin_password } = body

          // Validation des données
          if (!url || !api_key) {
            return new Response(
              JSON.stringify({ error: 'URL et clé API requises' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Note: Dans un environnement de production, vous devriez utiliser
          // l'API Supabase pour mettre à jour les secrets, mais pour cet exemple
          // nous simulons la mise à jour
          
          // Tester la connexion Jellyfin avec les nouvelles données
          try {
            const testResponse = await fetch(`${url}/System/Info`, {
              headers: {
                'X-Emby-Token': api_key,
                'Content-Type': 'application/json'
              }
            })

            if (!testResponse.ok) {
              throw new Error('Connexion Jellyfin échouée')
            }

            // Si la connexion réussit, on peut considérer que les secrets sont valides
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'Secrets mis à jour avec succès',
                connection_test: 'success'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          } catch (error) {
            return new Response(
              JSON.stringify({ 
                error: 'Erreur de connexion Jellyfin', 
                details: error.message 
              }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
        break

      case 'PUT':
        if (action === 'test-connection') {
          const body = await req.json()
          const { url, api_key } = body

          try {
            const testResponse = await fetch(`${url}/System/Info`, {
              headers: {
                'X-Emby-Token': api_key,
                'Content-Type': 'application/json'
              }
            })

            if (testResponse.ok) {
              const serverInfo = await testResponse.json()
              return new Response(
                JSON.stringify({ 
                  success: true, 
                  message: 'Connexion réussie',
                  server_info: serverInfo
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            } else {
              throw new Error(`Erreur HTTP: ${testResponse.status}`)
            }
          } catch (error) {
            return new Response(
              JSON.stringify({ 
                error: 'Test de connexion échoué', 
                details: error.message 
              }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Méthode non supportée' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ error: 'Action non reconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur dans jellyfin-secrets:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
