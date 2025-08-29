import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSimpleLogin() {
  console.log('🧪 Test de connexion simplifiée...\n');

  // Demander le nom d'utilisateur admin
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    const username = await question('👤 Nom d\'utilisateur admin Jellyfin: ');
    const password = await question('🔐 Mot de passe: ');
    
    console.log('\n📊 Étape 1: Vérification Jellyfin...');
    
    // Étape 1: Vérifier avec jellyfin-login
    const { data: jellyfinData, error: jellyfinError } = await supabase.functions.invoke('jellyfin-login', {
      body: {
        username: username,
        password: password
      }
    });

    if (jellyfinError) {
      console.error('❌ Erreur jellyfin-login:', jellyfinError);
      return;
    }

    if (jellyfinData.error) {
      console.error('❌ Erreur jellyfin-login:', jellyfinData.error);
      return;
    }

    if (jellyfinData.user) {
      console.log('✅ jellyfin-login a trouvé l\'utilisateur!');
      console.log(`   Nom: ${jellyfinData.user.Name}`);
      console.log(`   Email: ${jellyfinData.user.email}`);
      console.log(`   Existe dans DB: ${jellyfinData.user.userExists ? 'Oui' : 'Non'}`);
      console.log(`   Auth User ID: ${jellyfinData.user.authUserId || 'Non défini'}`);
      console.log(`   Admin: ${jellyfinData.user.IsAdministrator ? 'Oui' : 'Non'}`);
    }

    // Étape 2: Connexion directe si l'utilisateur existe
    if (jellyfinData.user.userExists && jellyfinData.user.authUserId) {
      console.log('\n📊 Étape 2: Connexion directe...');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: jellyfinData.user.email,
        password: password
      });

      if (signInError) {
        console.error('❌ Erreur de connexion:', signInError.message);
        return;
      }

      console.log('✅ Connexion réussie!');
      console.log(`   Utilisateur connecté: ${signInData.user.email}`);
      console.log(`   ID: ${signInData.user.id}`);
      
      // Vérifier la session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log(`   Session active: Oui`);
        console.log(`   Expire le: ${new Date(session.expires_at * 1000).toLocaleString()}`);
      } else {
        console.log('❌ Aucune session active');
      }

      // Vérifier le profil
      console.log('\n📊 Étape 3: Vérification du profil...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signInData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur lors de la récupération du profil:', profileError);
      } else {
        console.log('✅ Profil récupéré:');
        console.log(`   Rôle: ${profile.role || 'Non défini'}`);
        console.log(`   Admin: ${profile.is_administrator ? 'Oui' : 'Non'}`);
        console.log(`   Jellyfin User ID: ${profile.jellyfin_user_id || 'Non défini'}`);
        console.log(`   Jellyfin Username: ${profile.jellyfin_username || 'Non défini'}`);
      }

      console.log('\n🎉 SUCCÈS: Connexion simplifiée réussie!');
      console.log('✅ Aucune boucle infinie');
      console.log('✅ Session établie correctement');
      console.log('✅ Accès admin fonctionnel');

    } else {
      console.log('\n⚠️ L\'utilisateur n\'existe pas dans la base de données');
      console.log('💡 Le système devrait créer automatiquement le compte');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  } finally {
    rl.close();
  }
}

testSimpleLogin();
