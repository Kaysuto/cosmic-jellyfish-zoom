import fetch from 'node-fetch';

const SUPABASE_URL = "https://tgffkwoekuaetahrwioo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4";

async function testGetJellyfinSettings() {
  console.log('🧪 Test de la fonction Edge get-jellyfin-settings...\n');

  const functionUrl = `${SUPABASE_URL}/functions/v1/get-jellyfin-settings`;

  try {
    console.log('📤 Envoi de la requête GET...');
    console.log('URL:', functionUrl);

    const response = await fetch(functionUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
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
      
      if (responseJson.settings) {
        console.log('\n✅ Paramètres Jellyfin:');
        console.log(`   URL: ${responseJson.settings.url || 'Non configuré'}`);
        console.log(`   API Key: ${responseJson.settings.api_key ? 'Configuré' : 'Non configuré'}`);
        console.log(`   Existe: ${responseJson.exists}`);
      }
    } catch (parseError) {
      console.log('\n⚠️  Impossible de parser la réponse comme JSON');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testGetJellyfinSettings();
