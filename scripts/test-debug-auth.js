import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDebugAuth() {
  console.log('🔍 Debug de l\'authentification Jellyfin...\n');

  try {
    const username = 'Kimiya';
    const password = 'ENZlau2025+';
    
    console.log('📊 Test 1: Authentification Jellyfin de base...');
    
    // Test avec la fonction jellyfin-login existante
    const { data: jellyfinData, error: jellyfinError } = await supabase.functions.invoke('jellyfin-login', {
      body: {
        username: username,
        password: password
      }
    });

    if (jellyfinError) {
      console.error('❌ Erreur jellyfin-login:', jellyfinError);
    } else if (jellyfinData.error) {
      console.error('❌ Erreur jellyfin-login:', jellyfinData.error);
    } else {
      console.log('✅ jellyfin-login fonctionne!');
      console.log(`   Utilisateur: ${jellyfinData.user.Name}`);
      console.log(`   Email: ${jellyfinData.user.email}`);
      console.log(`   Existe dans DB: ${jellyfinData.user.userExists}`);
      console.log(`   Auth User ID: ${jellyfinData.user.authUserId}`);
    }

    console.log('\n📊 Test 2: Vérification de l\'utilisateur existant...');
    
    // Vérifier si l'utilisateur existe déjà
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'kimiya@jellyfin.local',
      password: password
    });

    if (signInError) {
      console.log('⚠️  Connexion Supabase échouée (normal):', signInError.message);
      
      // L'utilisateur n'existe pas ou mot de passe différent
      console.log('\n📊 Test 3: Création de l\'utilisateur...');
      
      // Utiliser la fonction create-jellyfin-user-account
      const { data: createData, error: createError } = await supabase.functions.invoke('create-jellyfin-user-account', {
        body: {
          jellyfin_user_id: 'test-id',
          email: 'kimiya@jellyfin.local',
          password: password,
          first_name: 'Kimiya',
          last_name: ''
        }
      });

      if (createError) {
        console.error('❌ Erreur création utilisateur:', createError);
      } else if (createData.error) {
        console.error('❌ Erreur création utilisateur:', createData.error);
      } else {
        console.log('✅ Utilisateur créé avec succès!');
        console.log(`   ID: ${createData.user.id}`);
        console.log(`   Email: ${createData.user.email}`);
      }
    } else {
      console.log('✅ Connexion Supabase réussie!');
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

testDebugAuth();
