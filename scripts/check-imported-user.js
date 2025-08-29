import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkImportedUser() {
  console.log('🔍 Vérification des utilisateurs importés...\n');

  // Demander le nom d'utilisateur Jellyfin
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    const username = await question('👤 Nom d\'utilisateur Jellyfin importé: ');
    
    console.log('\n📊 Vérification dans la base de données...');
    
    // Vérifier dans la table profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .or(`jellyfin_username.eq.${username},email.eq.${username}@jellyfin.local`);

    if (profilesError) {
      console.error('❌ Erreur lors de la vérification des profils:', profilesError);
      return;
    }

    console.log(`\n📋 Utilisateurs trouvés dans profiles: ${profiles.length}`);
    
    if (profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`\n👤 Utilisateur ${index + 1}:`);
        console.log(`   ID: ${profile.id}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Jellyfin User ID: ${profile.jellyfin_user_id || 'Non défini'}`);
        console.log(`   Jellyfin Username: ${profile.jellyfin_username || 'Non défini'}`);
        console.log(`   Auth User ID: ${profile.auth_user_id || 'Non défini'}`);
        console.log(`   Rôle: ${profile.role || 'Non défini'}`);
      });
    } else {
      console.log('❌ Aucun utilisateur trouvé dans la table profiles');
    }

    console.log('\n🔐 Test de reconnaissance par jellyfin-login...');
    
    // Tester avec jellyfin-login (sans mot de passe pour voir la reconnaissance)
    const { data: jellyfinData, error: jellyfinError } = await supabase.functions.invoke('jellyfin-login', {
      body: {
        username: username,
        password: 'test_password_wrong' // Mot de passe incorrect pour tester la reconnaissance
      }
    });

    if (jellyfinError) {
      console.error('❌ Erreur lors de l\'appel jellyfin-login:', jellyfinError);
    } else if (jellyfinData.error) {
      if (jellyfinData.error.includes('Invalid Jellyfin credentials')) {
        console.log('✅ jellyfin-login reconnaît l\'utilisateur (erreur d\'authentification normale)');
        console.log('💡 L\'utilisateur existe dans Jellyfin mais le mot de passe est incorrect');
      } else {
        console.log('❌ Erreur jellyfin-login:', jellyfinData.error);
      }
    } else if (jellyfinData.user) {
      console.log('✅ jellyfin-login a trouvé l\'utilisateur!');
      console.log(`   Nom: ${jellyfinData.user.Name}`);
      console.log(`   Email: ${jellyfinData.user.email}`);
      console.log(`   Existe dans DB: ${jellyfinData.user.userExists ? 'Oui' : 'Non'}`);
      console.log(`   Auth User ID: ${jellyfinData.user.authUserId || 'Non défini'}`);
    }

    console.log('\n📝 Recommandations:');
    if (profiles.length > 0) {
      console.log('✅ L\'utilisateur est bien importé dans la base de données');
      console.log('✅ Le système devrait le reconnaître lors de la connexion');
      console.log('✅ Aucun doublon ne sera créé');
    } else {
      console.log('⚠️  L\'utilisateur n\'est pas trouvé dans la base de données');
      console.log('💡 Le système créera automatiquement un compte lors de la première connexion');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  } finally {
    rl.close();
  }
}

checkImportedUser();
