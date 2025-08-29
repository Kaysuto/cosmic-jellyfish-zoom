import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0OTcyOTAsImV4cCI6MjA1MTA3MzI5MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testJellyfinMapping() {
  try {
    console.log('🔍 Test de connexion Jellyfin avec mapping...\n');

    // 1. Vérifier les paramètres Jellyfin
    console.log('1️⃣ Vérification des paramètres Jellyfin...');
    
    const { data: settings, error: settingsError } = await supabase
      .from('jellyfin_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsError) {
      console.log('❌ Erreur jellyfin_settings:', settingsError);
      return;
    } else {
      console.log('✅ Paramètres Jellyfin:');
      console.log(`  - URL: ${settings.url}`);
      console.log(`  - API Key: ${settings.api_key ? '***configurée***' : '❌ manquante'}`);
    }

    // 2. Vérifier le mapping existant
    console.log('\n2️⃣ Vérification du mapping existant...');
    
    const { data: mapping, error: mappingError } = await supabase
      .from('profiles')
      .select('id, email, jellyfin_username, jellyfin_user_id')
      .eq('jellyfin_username', 'Kimiya')
      .single();

    if (mappingError) {
      console.log('❌ Erreur mapping:', mappingError);
    } else if (mapping) {
      console.log('✅ Mapping trouvé:');
      console.log(`  - Email: ${mapping.email}`);
      console.log(`  - Jellyfin username: ${mapping.jellyfin_username}`);
      console.log(`  - Jellyfin user ID: ${mapping.jellyfin_user_id || 'Non défini'}`);
    } else {
      console.log('❌ Aucun mapping trouvé pour "Kimiya"');
    }

    // 3. Tester la fonction Edge jellyfin-login
    console.log('\n3️⃣ Test de la fonction Edge jellyfin-login...');
    
    // Remplace par tes vrais identifiants Jellyfin
    const testResponse = await supabase.functions.invoke('jellyfin-login', {
      body: {
        username: 'Kimiya', // Ton nom d'utilisateur Jellyfin
        password: 'ton-mot-de-passe' // Ton mot de passe Jellyfin
      }
    });

    console.log('Réponse de jellyfin-login:', {
      data: testResponse.data,
      error: testResponse.error
    });

    if (testResponse.data?.user) {
      console.log('\n✅ Détails de l\'utilisateur Jellyfin:');
      console.log(`  - ID: ${testResponse.data.user.Id}`);
      console.log(`  - Nom: ${testResponse.data.user.Name}`);
      console.log(`  - Email: ${testResponse.data.user.email}`);
      console.log(`  - Existe dans la DB: ${testResponse.data.user.userExists}`);
      console.log(`  - Auth User ID: ${testResponse.data.user.authUserId}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testJellyfinMapping();
