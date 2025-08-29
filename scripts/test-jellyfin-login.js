import fetch from 'node-fetch';

const SUPABASE_URL = "https://tgffkwoekuaetahrwioo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4";

async function testJellyfinLogin() {
  console.log('🧪 Test de la fonction Edge jellyfin-login...\n');

  const functionUrl = `${SUPABASE_URL}/functions/v1/jellyfin-login`;
  
  // Test avec des identifiants de test
  const testData = {
    username: 'test_user',
    password: 'test_password'
  };

  try {
    console.log('📤 Envoi de la requête POST...');
    console.log('URL:', functionUrl);
    console.log('Données:', JSON.stringify(testData, null, 2));

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testData)
    });

    console.log('\n📥 Réponse reçue:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const responseText = await response.text();
    console.log('\n📄 Corps de la réponse:');
    console.log(responseText);

    try {
      const responseJson = JSON.parse(responseText);
      console.log('\n🔍 Réponse JSON parsée:');
      console.log(JSON.stringify(responseJson, null, 2));
      
      if (responseJson.user) {
        console.log('\n✅ Informations utilisateur:');
        console.log(`   ID Jellyfin: ${responseJson.user.Id}`);
        console.log(`   Nom: ${responseJson.user.Name}`);
        console.log(`   Email: ${responseJson.user.email}`);
        console.log(`   Admin: ${responseJson.user.IsAdministrator}`);
        console.log(`   Existe déjà: ${responseJson.user.userExists}`);
        console.log(`   Auth User ID: ${responseJson.user.authUserId || 'N/A'}`);
      }
    } catch (parseError) {
      console.log('\n⚠️  Impossible de parser la réponse comme JSON');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testJellyfinLogin();
