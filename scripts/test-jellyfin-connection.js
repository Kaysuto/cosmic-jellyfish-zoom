import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0OTcyOTAsImV4cCI6MjA1MTA3MzI5MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testJellyfinConnection() {
  try {
    console.log('🔍 Test de connexion Jellyfin...\n');

    // 1. Tester la fonction Edge jellyfin-login
    console.log('1️⃣ Test de la fonction Edge jellyfin-login...');
    
    const testResponse = await supabase.functions.invoke('jellyfin-login', {
      body: {
        username: 'test',
        password: 'test'
      }
    });

    console.log('Réponse de jellyfin-login:', {
      data: testResponse.data,
      error: testResponse.error
    });

    // 2. Vérifier la structure de la table profiles
    console.log('\n2️⃣ Vérification de la structure de la table profiles...');
    
    const { data: profilesSample, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.log('❌ Erreur table profiles:', profilesError);
    } else {
      console.log('✅ Structure de la table profiles:');
      if (profilesSample && profilesSample.length > 0) {
        Object.keys(profilesSample[0]).forEach(col => {
          console.log(`  - ${col}: ${typeof profilesSample[0][col]}`);
        });
      } else {
        console.log('  ℹ️ Table profiles vide');
      }
    }

    // 3. Vérifier les paramètres Jellyfin
    console.log('\n3️⃣ Vérification des paramètres Jellyfin...');
    
    const { data: jellyfinSettings, error: settingsError } = await supabase
      .from('jellyfin_settings')
      .select('*');

    if (settingsError) {
      console.log('❌ Erreur jellyfin_settings:', settingsError);
    } else {
      console.log('✅ Paramètres Jellyfin:', jellyfinSettings);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testJellyfinConnection();
