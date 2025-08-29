import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSyncPasswordFix() {
  console.log('🧪 Test de la nouvelle fonction de synchronisation de mot de passe...\n');

  // Demander les identifiants
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    const username = await question('👤 Nom d\'utilisateur Jellyfin: ');
    const password = await question('🔐 Mot de passe: ');
    
    console.log('\n📊 Étape 1: Authentification Jellyfin...');
    
    // Étape 1: Authentifier avec Jellyfin
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

    console.log('✅ Authentification Jellyfin réussie!');
    console.log(`   Utilisateur: ${jellyfinData.user.Name}`);
    console.log(`   Email: ${jellyfinData.user.email}`);
    console.log(`   Existe dans DB: ${jellyfinData.user.userExists ? 'Oui' : 'Non'}`);
    console.log(`   Auth User ID: ${jellyfinData.user.authUserId || 'Non défini'}`);

    // Étape 2: Test de connexion Supabase (devrait échouer si mot de passe différent)
    console.log('\n📊 Étape 2: Test de connexion Supabase...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: jellyfinData.user.email,
      password: password
    });

    if (signInError) {
      console.log('⚠️  Connexion Supabase échouée (normal si mot de passe différent)');
      console.log(`   Erreur: ${signInError.message}`);
      
      // Étape 3: Synchronisation du mot de passe
      if (jellyfinData.user.userExists && jellyfinData.user.authUserId) {
        console.log('\n📊 Étape 3: Synchronisation du mot de passe...');
        
        const { data: syncData, error: syncError } = await supabase.functions.invoke('jellyfin-sync-password', {
          body: {
            username: username,
            password: password
          }
        });

        if (syncError) {
          console.error('❌ Erreur de synchronisation:', syncError);
          return;
        }

        if (syncData.error) {
          console.error('❌ Erreur de synchronisation:', syncData.error);
          return;
        }

        if (syncData.success) {
          console.log('✅ Mot de passe synchronisé avec succès!');
          console.log(`   Utilisateur: ${syncData.user.email}`);
          console.log(`   ID: ${syncData.user.id}`);
          
          // Étape 4: Test de connexion après synchronisation
          console.log('\n📊 Étape 4: Test de connexion après synchronisation...');
          
          const { data: retrySignInData, error: retrySignInError } = await supabase.auth.signInWithPassword({
            email: jellyfinData.user.email,
            password: password
          });

          if (retrySignInError) {
            console.error('❌ Erreur de connexion après synchronisation:', retrySignInError.message);
            return;
          }

          console.log('✅ Connexion réussie après synchronisation!');
          console.log(`   Utilisateur connecté: ${retrySignInData.user.email}`);
          console.log(`   ID: ${retrySignInData.user.id}`);
          
          // Vérifier la session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log(`   Session active: Oui`);
            console.log(`   Expire le: ${new Date(session.expires_at * 1000).toLocaleString()}`);
          } else {
            console.log('❌ Aucune session active');
          }

          // Déconnexion
          await supabase.auth.signOut();
          console.log('🔓 Déconnexion effectuée');
        }
      } else {
        console.log('⚠️  Utilisateur non trouvé dans la base de données, création nécessaire');
      }
    } else {
      console.log('✅ Connexion Supabase réussie directement!');
      console.log(`   Utilisateur connecté: ${signInData.user.email}`);
      console.log(`   ID: ${signInData.user.id}`);
      
      // Déconnexion
      await supabase.auth.signOut();
      console.log('🔓 Déconnexion effectuée');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  } finally {
    rl.close();
  }
}

testSyncPasswordFix();
