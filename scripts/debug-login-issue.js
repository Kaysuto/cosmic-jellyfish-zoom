import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugLoginIssue() {
  console.log('🔍 Diagnostic du problème de connexion...\n');

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

    // Étape 2: Vérifier le profil dans la base de données
    console.log('\n📊 Étape 2: Vérification du profil dans la DB...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .or(`jellyfin_username.eq.${username},email.eq.${username}@jellyfin.local`);

    if (profilesError) {
      console.error('❌ Erreur lors de la vérification des profils:', profilesError);
      return;
    }

    console.log(`📋 Utilisateurs trouvés dans profiles: ${profiles.length}`);
    
    if (profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`\n👤 Utilisateur ${index + 1}:`);
        console.log(`   ID: ${profile.id}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Jellyfin User ID: ${profile.jellyfin_user_id || 'Non défini'}`);
        console.log(`   Jellyfin Username: ${profile.jellyfin_username || 'Non défini'}`);
        console.log(`   Auth User ID: ${profile.auth_user_id || 'Non défini'}`);
        console.log(`   Rôle: ${profile.role || 'Non défini'}`);
        console.log(`   Admin: ${profile.is_administrator ? 'Oui' : 'Non'}`);
      });

      // Étape 3: Tester la connexion avec l'email du profil
      const profile = profiles[0]; // Prendre le premier profil
      console.log(`\n📊 Étape 3: Test de connexion avec l'email: ${profile.email}`);
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: password
      });

      if (signInError) {
        console.error('❌ Erreur de connexion:', signInError.message);
        console.log('💡 Le mot de passe Supabase est différent du mot de passe Jellyfin');
        
        // Étape 4: Vérifier si l'utilisateur existe dans Supabase Auth
        console.log('\n📊 Étape 4: Vérification dans Supabase Auth...');
        
        // Essayer de récupérer l'utilisateur par email
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(profile.email);
        
        if (authError) {
          console.error('❌ Erreur lors de la récupération de l\'utilisateur Auth:', authError);
        } else if (authUser) {
          console.log('✅ Utilisateur trouvé dans Supabase Auth:');
          console.log(`   ID: ${authUser.user.id}`);
          console.log(`   Email: ${authUser.user.email}`);
          console.log(`   Créé le: ${new Date(authUser.user.created_at).toLocaleString()}`);
          console.log(`   Dernière connexion: ${authUser.user.last_sign_in_at ? new Date(authUser.user.last_sign_in_at).toLocaleString() : 'Jamais'}`);
        }
        
        console.log('\n🔧 SOLUTIONS POSSIBLES:');
        console.log('1. Le mot de passe Supabase est différent du mot de passe Jellyfin');
        console.log('2. L\'utilisateur a été créé avec un mot de passe différent');
        console.log('3. Il faut réinitialiser le mot de passe Supabase');
        
      } else {
        console.log('✅ Connexion réussie!');
        console.log(`   Utilisateur connecté: ${signInData.user.email}`);
        console.log(`   ID: ${signInData.user.id}`);
        
        // Vérifier la session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log(`   Session active: Oui`);
          console.log(`   Expire le: ${new Date(session.expires_at * 1000).toLocaleString()}`);
        }
      }
    } else {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      console.log('💡 L\'utilisateur n\'est pas mappé correctement');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  } finally {
    rl.close();
  }
}

debugLoginIssue();
