/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
// @ts-nocheck

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { userId } = await req.json()
    if (!userId) {
      throw new Error("User ID is required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: factors, error: listError } = await supabaseAdmin.auth.admin.mfa.listFactors({ userId })

    if (listError) throw listError;

    for (const factor of factors) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.mfa.deleteFactor({
        id: factor.id,
        userId: userId
      })
      if (deleteError) {
        console.error(`Failed to delete factor ${factor.id} for user ${userId}:`, deleteError.message)
      }
    }

    return new Response(JSON.stringify({ message: `All MFA factors for user ${userId} have been unenrolled.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})