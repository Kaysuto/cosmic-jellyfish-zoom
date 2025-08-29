import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateJellyfinUser() {
  console.log('🧪 Test de la fonction create-jellyfin-user-account...\n');

  // Demander les identifiants à l'utilisateur
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    const jellyfinUserId = await question('🆔 ID utilisateur Jellyfin: ');
    const email = await question('📧 Email: ');
    const password = await question('🔒 Mot de passe: ');
    const firstName = await question('👤 Prénom (optionnel): ') || '';
    const lastName = await question('👤 Nom (optionnel): ') || '';
    
    console.log('\n📤 Envoi de la requête de création...');
    
    // Appeler la fonction Edge create-jellyfin-user-account
    const { data, error } = await supabase.functions.invoke('create-jellyfin-user-account', {
      body: {
        jellyfin_user_id: jellyfinUserId,
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName
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
      console.log('\n❌ Erreur de création:', data.error);
    } else if (data.success) {
      console.log('\n✅ Compte créé avec succès!');
      console.log('👤 Utilisateur:', data.user);
      
      // Tester la connexion avec le nouveau compte
      console.log('\n🔐 Test de connexion avec le nouveau compte...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (signInError) {
        console.log('❌ Erreur de connexion:', signInError.message);
      } else {
        console.log('✅ Connexion réussie!');
        console.log('🔑 Session créée pour:', signInData.user.email);
      }
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  } finally {
    rl.close();
  }
}

testCreateJellyfinUser();
