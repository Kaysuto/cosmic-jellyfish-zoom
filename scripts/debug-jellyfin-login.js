import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0OTcyOTAsImV4cCI6MjA1MTA3MzI5MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugJellyfinLogin() {
  try {
    console.log('🔍 Débogage de la fonction jellyfin-login...\n');

    // 1. Vérifier le mapping dans la base de données
    console.log('1️⃣ Vérification du mapping dans la base de données...');
    
    const { data: mapping, error: mappingError } = await supabase
      .from('profiles')
      .select('id, email, jellyfin_username, jellyfin_user_id, is_administrator, role')
      .eq('jellyfin_username', 'Kimiya')
      .single();

    if (mappingError) {
      console.log('❌ Erreur mapping:', mappingError);
    } else if (mapping) {
      console.log('✅ Mapping trouvé:');
      console.log(`  - ID: ${mapping.id}`);
      console.log(`  - Email: ${mapping.email}`);
      console.log(`  - Jellyfin username: ${mapping.jellyfin_username}`);
      console.log(`  - Jellyfin user ID: ${mapping.jellyfin_user_id}`);
      console.log(`  - Is Administrator: ${mapping.is_administrator}`);
      console.log(`  - Role: ${mapping.role}`);
    } else {
      console.log('❌ Aucun mapping trouvé pour "Kimiya"');
    }

    // 2. Vérifier les paramètres Jellyfin
    console.log('\n2️⃣ Vérification des paramètres Jellyfin...');
    
    const { data: settings, error: settingsError } = await supabase
      .from('jellyfin_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsError) {
      console.log('❌ Erreur jellyfin_settings:', settingsError);
    } else {
      console.log('✅ Paramètres Jellyfin:');
      console.log(`  - URL: ${settings.url}`);
      console.log(`  - API Key: ${settings.api_key ? '***configurée***' : '❌ manquante'}`);
    }

    // 3. Tester la fonction Edge avec des identifiants de test
    console.log('\n3️⃣ Test de la fonction Edge jellyfin-login...');
    
    // Remplace par tes vrais identifiants Jellyfin
    const testResponse = await supabase.functions.invoke('jellyfin-login', {
      body: {
        username: 'Kimiya', // Ton nom d'utilisateur Jellyfin
        password: 'ton-mot-de-passe' // Ton mot de passe Jellyfin
      }
    });

    console.log('Réponse complète de jellyfin-login:', {
      data: testResponse.data,
      error: testResponse.error,
      status: testResponse.error?.context?.status
    });

    if (testResponse.data?.user) {
      console.log('\n✅ Détails de l\'utilisateur Jellyfin:');
      console.log(`  - ID: ${testResponse.data.user.Id}`);
      console.log(`  - Nom: ${testResponse.data.user.Name}`);
      console.log(`  - Email: ${testResponse.data.user.email}`);
      console.log(`  - Existe dans la DB: ${testResponse.data.user.userExists}`);
      console.log(`  - Auth User ID: ${testResponse.data.user.authUserId}`);
      console.log(`  - Is Administrator: ${testResponse.data.user.IsAdministrator}`);
      
      if (testResponse.data.user.userExists) {
        console.log('\n🎉 SUCCÈS: L\'utilisateur existe dans la base de données!');
        console.log('Le mapping fonctionne correctement.');
      } else {
        console.log('\n⚠️ L\'utilisateur n\'existe pas dans la base de données.');
        console.log('Le mapping ne fonctionne pas.');
      }
    } else if (testResponse.error) {
      console.log('\n❌ Erreur lors de l\'authentification Jellyfin:');
      console.log(`  - Message: ${testResponse.error.message}`);
      console.log(`  - Status: ${testResponse.error.context?.status}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

debugJellyfinLogin();
