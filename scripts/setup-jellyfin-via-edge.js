import fetch from 'node-fetch';

const SUPABASE_URL = "https://tgffkwoekuaetahrwioo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4";

async function setupJellyfinSettings() {
  console.log('🔧 Configuration des paramètres Jellyfin via Edge Function...\n');

  // Demander les paramètres à l'utilisateur
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    console.log('📝 Veuillez fournir vos paramètres Jellyfin :\n');
    
    const url = await question('URL de votre serveur Jellyfin (ex: http://192.168.1.100:8096): ');
    const apiKey = await question('Clé API Jellyfin: ');

    rl.close();

    if (!url || !apiKey) {
      console.log('\n❌ URL et clé API sont requis');
      return;
    }

    console.log('\n📤 Envoi de la configuration...');

    const functionUrl = `${SUPABASE_URL}/functions/v1/setup-jellyfin-settings`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        url: url.trim(),
        api_key: apiKey.trim()
      })
    });

    console.log('\n📥 Réponse reçue:');
    console.log('Status:', response.status);

    const responseText = await response.text();
    console.log('Corps de la réponse:', responseText);

    try {
      const responseJson = JSON.parse(responseText);
      
      if (responseJson.success) {
        console.log('\n✅ Configuration réussie !');
        console.log('📋 Paramètres configurés:');
        console.log(`   URL: ${responseJson.settings.url}`);
        console.log(`   API Key: ${responseJson.settings.api_key}`);
        console.log(`   ID: ${responseJson.settings.id}`);
        
        console.log('\n🧪 Test de la fonction jellyfin-auth...');
        await testJellyfinAuth();
      } else {
        console.log('\n❌ Erreur:', responseJson.error);
      }
    } catch (parseError) {
      console.log('\n⚠️  Impossible de parser la réponse JSON');
    }

  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration:', error.message);
  }
}

async function testJellyfinAuth() {
  const functionUrl = `${SUPABASE_URL}/functions/v1/jellyfin-auth`;
  
  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        username: 'test_user',
        password: 'test_password'
      })
    });

    const responseText = await response.text();
    
    if (response.status === 500 && responseText.includes('Jellyfin settings not configured')) {
      console.log('❌ Les paramètres ne sont pas encore pris en compte');
      console.log('💡 Attendez quelques secondes et réessayez');
    } else if (response.status === 401) {
      console.log('✅ Configuration correcte ! (Erreur 401 attendue avec des identifiants de test)');
    } else {
      console.log('📄 Réponse:', responseText);
    }
  } catch (error) {
    console.log('❌ Erreur de test:', error.message);
  }
}

setupJellyfinSettings();
