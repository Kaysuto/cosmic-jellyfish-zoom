import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFunctionAccess() {
  console.log('🧪 Test d\'accès aux fonctions Edge...\n');

  try {
    // Test 1: Fonction qui fonctionne déjà
    console.log('📊 Test 1: jellyfin-login (fonction existante)...');
    const { data: loginData, error: loginError } = await supabase.functions.invoke('jellyfin-login', {
      body: {
        username: 'test',
        password: 'test'
      }
    });

    if (loginError) {
      console.log('❌ Erreur jellyfin-login:', loginError.message);
    } else {
      console.log('✅ jellyfin-login accessible');
    }

    // Test 2: Nouvelle fonction
    console.log('\n📊 Test 2: jellyfin-sync-password (nouvelle fonction)...');
    const { data: syncData, error: syncError } = await supabase.functions.invoke('jellyfin-sync-password', {
      body: {
        username: 'test',
        password: 'test'
      }
    });

    if (syncError) {
      console.log('❌ Erreur jellyfin-sync-password:', syncError.message);
      console.log('💡 La fonction n\'est peut-être pas encore disponible');
    } else {
      console.log('✅ jellyfin-sync-password accessible');
    }

    // Test 3: Test direct avec fetch
    console.log('\n📊 Test 3: Test direct avec fetch...');
    try {
      const response = await fetch('https://tgffkwoekuaetahrwioo.supabase.co/functions/v1/jellyfin-sync-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          username: 'test',
          password: 'test'
        })
      });

      console.log('📊 Status:', response.status);
      console.log('📊 Status Text:', response.statusText);
      
      if (response.ok) {
        console.log('✅ Fonction accessible via fetch');
      } else {
        console.log('❌ Fonction non accessible via fetch');
      }
    } catch (fetchError) {
      console.log('❌ Erreur fetch:', fetchError.message);
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testFunctionAccess();
