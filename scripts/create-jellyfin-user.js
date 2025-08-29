import fetch from 'node-fetch';

const SUPABASE_URL = "https://tgffkwoekuaetahrwioo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4";

async function createJellyfinUser() {
  console.log('🔧 Création d\'un compte utilisateur pour un utilisateur Jellyfin...\n');

  // Demander les paramètres à l'utilisateur
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    console.log('📝 Veuillez fournir les informations de l\'utilisateur :\n');
    
    const jellyfinUserId = await question('ID utilisateur Jellyfin: ');
    const email = await question('Email pour le compte: ');
    const password = await question('Mot de passe pour le compte: ');
    const firstName = await question('Prénom (optionnel): ');
    const lastName = await question('Nom de famille (optionnel): ');

    rl.close();

    if (!jellyfinUserId || !email || !password) {
      console.log('\n❌ ID Jellyfin, email et mot de passe sont requis');
      return;
    }

    console.log('\n📤 Création du compte...');

    const functionUrl = `${SUPABASE_URL}/functions/v1/create-jellyfin-user-account`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        jellyfin_user_id: jellyfinUserId.trim(),
        email: email.trim(),
        password: password.trim(),
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined
      })
    });

    console.log('\n📥 Réponse reçue:');
    console.log('Status:', response.status);

    const responseText = await response.text();
    console.log('Corps de la réponse:', responseText);

    try {
      const responseJson = JSON.parse(responseText);
      
      if (responseJson.success) {
        console.log('\n✅ Compte créé avec succès !');
        console.log('📋 Informations du compte:');
        console.log(`   ID: ${responseJson.user.id}`);
        console.log(`   Email: ${responseJson.user.email}`);
        console.log(`   ID Jellyfin: ${responseJson.user.jellyfin_user_id}`);
        console.log(`   Prénom: ${responseJson.user.first_name}`);
        console.log(`   Nom: ${responseJson.user.last_name}`);
        console.log(`   Rôle: ${responseJson.user.role}`);
        
        console.log('\n💡 L\'utilisateur peut maintenant se connecter avec ses identifiants Jellyfin');
      } else {
        console.log('\n❌ Erreur:', responseJson.error);
        if (responseJson.details) {
          console.log('Détails:', responseJson.details);
        }
        if (responseJson.existing_user) {
          console.log('Utilisateur existant:', responseJson.existing_user);
        }
      }
    } catch (parseError) {
      console.log('\n⚠️  Impossible de parser la réponse JSON');
    }

  } catch (error) {
    console.error('\n❌ Erreur lors de la création:', error.message);
  }
}

createJellyfinUser();
