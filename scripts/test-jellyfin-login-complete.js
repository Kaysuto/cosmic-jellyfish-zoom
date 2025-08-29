import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testJellyfinLoginComplete() {
  console.log('🧪 Test complet du processus de connexion Jellyfin...\n');

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
    
    console.log('\n📤 Étape 1: Authentification Jellyfin...');
    
    // Étape 1: Authentification Jellyfin
    const { data: jellyfinData, error: jellyfinError } = await supabase.functions.invoke('jellyfin-login', {
      body: {
        username: username,
        password: password
      }
    });

    if (jellyfinError) {
      console.error('❌ Erreur lors de l\'authentification Jellyfin:', jellyfinError);
      return;
    }

    if (jellyfinData.error) {
      console.log('❌ Erreur d\'authentification Jellyfin:', jellyfinData.error);
      return;
    }

    console.log('✅ Authentification Jellyfin réussie!');
    console.log('👤 Utilisateur:', jellyfinData.user.Name);
    console.log('📧 Email:', jellyfinData.user.email);
    console.log('💾 Existe dans la DB:', jellyfinData.user.userExists ? 'Oui' : 'Non');

    if (jellyfinData.user.userExists && jellyfinData.user.authUserId) {
      console.log('\n📤 Étape 2: Connexion avec utilisateur existant...');
      
      // Étape 2: Connexion avec utilisateur existant
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: jellyfinData.user.email,
        password: password
      });

      if (signInError) {
        console.log('❌ Erreur de connexion:', signInError.message);
        return;
      }

      console.log('✅ Connexion réussie avec utilisateur existant!');
      console.log('🔑 Session créée pour:', signInData.user.email);
      
    } else {
      console.log('\n📤 Étape 2: Création automatique du compte...');
      
      // Étape 2: Création automatique du compte
      const { data: createData, error: createError } = await supabase.functions.invoke('create-jellyfin-user-account', {
        body: {
          jellyfin_user_id: jellyfinData.user.Id,
          email: jellyfinData.user.email,
          password: password,
          first_name: jellyfinData.user.Name,
          last_name: ''
        }
      });

      if (createError) {
        console.error('❌ Erreur lors de la création du compte:', createError);
        return;
      }

      if (createData.error) {
        console.log('❌ Erreur de création:', createData.error);
        return;
      }

      console.log('✅ Compte créé avec succès!');
      console.log('👤 Utilisateur créé:', createData.user);

      console.log('\n📤 Étape 3: Connexion avec le nouveau compte...');
      
      // Étape 3: Connexion avec le nouveau compte
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: jellyfinData.user.email,
        password: password
      });

      if (signInError) {
        console.log('❌ Erreur de connexion:', signInError.message);
        return;
      }

      console.log('✅ Connexion réussie avec le nouveau compte!');
      console.log('🔑 Session créée pour:', signInData.user.email);
    }

    console.log('\n🎉 Processus complet réussi!');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  } finally {
    rl.close();
  }
}

testJellyfinLoginComplete();
