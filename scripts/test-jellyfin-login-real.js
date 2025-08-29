import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testJellyfinLogin() {
  console.log('🧪 Test de connexion Jellyfin avec de vrais identifiants...\n');

  // Demander les identifiants à l'utilisateur
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    const username = await question('👤 Nom d\'utilisateur Jellyfin: ');
    const password = await question('🔒 Mot de passe Jellyfin: ');
    
    console.log('\n📤 Envoi de la requête de connexion...');
    
    // Appeler la fonction Edge jellyfin-login
    const { data, error } = await supabase.functions.invoke('jellyfin-login', {
      body: {
        username: username,
        password: password
      }
    });

    if (error) {
      console.error('❌ Erreur lors de l\'appel de la fonction:', error);
      return;
    }

    console.log('\n📥 Réponse reçue:');
    console.log('Status: 200');
    console.log('Status Text: OK');
    
    console.log('\n📄 Corps de la réponse:');
    console.log(JSON.stringify(data, null, 2));

    if (data.error) {
      console.log('\n❌ Erreur de connexion:', data.error);
    } else if (data.user) {
      console.log('\n✅ Connexion réussie!');
      console.log('👤 Utilisateur:', data.user.Name);
      console.log('📧 Email:', data.user.email);
      console.log('🆔 ID Jellyfin:', data.user.Id);
      console.log('👑 Administrateur:', data.user.IsAdministrator ? 'Oui' : 'Non');
      console.log('💾 Existe dans la DB:', data.user.userExists ? 'Oui' : 'Non');
      
      if (data.user.authUserId) {
        console.log('🔗 ID Auth:', data.user.authUserId);
      }
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  } finally {
    rl.close();
  }
}

testJellyfinLogin();
