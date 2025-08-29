import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoginFix() {
  console.log('🔧 Test de la correction de connexion Jellyfin...\n');

  try {
    const username = 'Kimiya';
    const password = 'ENZlau2025+';
    
    console.log('📊 Authentification avec correction de connexion...');
    
    // Utiliser la nouvelle fonction de correction
    const { data: authData, error: authError } = await supabase.functions.invoke('jellyfin-login-fix', {
      body: {
        username: username,
        password: password
      }
    });

    if (authError) {
      console.error('❌ Erreur d\'authentification:', authError);
      return;
    }

    if (authData.error) {
      console.error('❌ Erreur d\'authentification:', authData.error);
      return;
    }

    console.log('✅ Authentification réussie!');
    console.log(`   Utilisateur: ${authData.user.name}`);
    console.log(`   Email: ${authData.user.email}`);
    console.log(`   ID: ${authData.user.id}`);
    console.log(`   Jellyfin User ID: ${authData.user.jellyfin_user_id}`);

    // Tester la session Supabase
    console.log('\n📊 Test de la session Supabase...');
    
    // Définir la session manuellement
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token
    });

    if (sessionError) {
      console.error('❌ Erreur de session:', sessionError);
      return;
    }

    console.log('✅ Session Supabase active!');
    console.log(`   Utilisateur connecté: ${sessionData.session.user.email}`);
    console.log(`   Expire le: ${new Date(sessionData.session.expires_at * 1000).toLocaleString()}`);

    // Tester l'accès aux données protégées
    console.log('\n📊 Test d\'accès aux données protégées...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erreur d\'accès au profil:', profileError);
    } else {
      console.log('✅ Accès au profil réussi!');
      console.log(`   Nom: ${profileData.first_name} ${profileData.last_name}`);
      console.log(`   Email: ${profileData.email}`);
      console.log(`   Rôle: ${profileData.role}`);
    }

    // Test de connexion avec le mot de passe synchronisé
    console.log('\n📊 Test de connexion avec mot de passe synchronisé...');
    
    // Déconnexion d'abord
    await supabase.auth.signOut();
    
    // Nouvelle connexion avec le mot de passe synchronisé
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: authData.user.email,
      password: password
    });

    if (signInError) {
      console.error('❌ Erreur de connexion après synchronisation:', signInError.message);
    } else {
      console.log('✅ Connexion réussie avec mot de passe synchronisé!');
      console.log(`   Utilisateur: ${signInData.user.email}`);
      console.log(`   ID: ${signInData.user.id}`);
    }

    // Déconnexion finale
    await supabase.auth.signOut();
    console.log('\n🔓 Déconnexion effectuée');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testLoginFix();
