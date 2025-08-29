import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFinalSolution() {
  console.log('🎯 Test de la solution finale...\n');

  try {
    const username = 'Kimiya';
    const password = 'ENZlau2025+';
    
    console.log('📊 Étape 1: Authentification Jellyfin...');
    
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
    console.log(`   Existe dans DB: ${jellyfinData.user.userExists}`);
    console.log(`   Auth User ID: ${jellyfinData.user.authUserId}`);

    // Étape 2: Test de connexion Supabase (devrait échouer)
    console.log('\n📊 Étape 2: Test de connexion Supabase...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: jellyfinData.user.email,
      password: password
    });

    if (signInError) {
      console.log('⚠️  Connexion Supabase échouée (normal):', signInError.message);
      
      // Étape 3: Solution - utiliser jellyfin-login et se reconnecter
      console.log('\n📊 Étape 3: Solution - Reconnexion avec jellyfin-login...');
      
      if (jellyfinData.user && jellyfinData.user.authUserId) {
        console.log('✅ Utilisateur trouvé dans la base de données, tentative de reconnexion...');
        
        // Nouvelle tentative de connexion
        const { data: retrySignInData, error: retrySignInError } = await supabase.auth.signInWithPassword({
          email: jellyfinData.user.email,
          password: password
        });

        if (retrySignInError) {
          console.error('❌ Échec de la reconnexion:', retrySignInError.message);
          console.log('💡 Solution: Les mots de passe sont différents, synchronisation nécessaire');
          
          // Ici on pourrait appeler une fonction de synchronisation
          console.log('🔧 Recommandation: Créer une fonction de synchronisation de mot de passe');
        } else {
          console.log('✅ Reconnexion réussie!');
          console.log(`   Utilisateur: ${retrySignInData.user.email}`);
          console.log(`   ID: ${retrySignInData.user.id}`);
          
          // Déconnexion
          await supabase.auth.signOut();
          console.log('🔓 Déconnexion effectuée');
        }
      } else {
        console.log('❌ Utilisateur non trouvé dans la base de données');
      }
    } else {
      console.log('✅ Connexion Supabase réussie directement!');
      console.log(`   Utilisateur: ${signInData.user.email}`);
      console.log(`   ID: ${signInData.user.id}`);
      
      // Déconnexion
      await supabase.auth.signOut();
      console.log('🔓 Déconnexion effectuée');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testFinalSolution();
