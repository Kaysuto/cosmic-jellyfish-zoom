import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminMapping() {
  console.log('🔍 Test du mapping admin et de la connexion...\n');

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
    
    console.log('\n📊 Vérification du mapping dans la base de données...');
    
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
        console.log(`   Admin: ${profile.is_administrator ? 'Oui' : 'Non'}`);
      });
    } else {
      console.log('❌ Aucun utilisateur trouvé dans la table profiles');
      return;
    }

    console.log('\n🔐 Test de connexion Jellyfin...');
    
    // Tester la connexion Jellyfin
    const { data: jellyfinData, error: jellyfinError } = await supabase.functions.invoke('jellyfin-login', {
      body: {
        username: username,
        password: password
      }
    });

    if (jellyfinError) {
      console.error('❌ Erreur lors de l\'appel jellyfin-login:', jellyfinError);
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

    console.log('\n🔐 Test de connexion directe...');
    
    // Tester la connexion directe
    const { data: directSignInData, error: directSignInError } = await supabase.functions.invoke('jellyfin-direct-signin', {
      body: {
        username: username,
        password: password
      }
    });

    if (directSignInError) {
      console.error('❌ Erreur lors de l\'appel jellyfin-direct-signin:', directSignInError);
      return;
    }

    if (directSignInData.error) {
      console.error('❌ Erreur jellyfin-direct-signin:', directSignInData.error);
      return;
    }

    if (directSignInData.success) {
      console.log('✅ Connexion directe réussie!');
      console.log(`   Utilisateur: ${directSignInData.user.email}`);
      console.log(`   Login info disponible: ${directSignInData.loginInfo ? 'Oui' : 'Non'}`);
      
      // Tester la connexion côté client
      console.log('\n🔐 Test de connexion côté client...');
      
      if (directSignInData.loginInfo) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: directSignInData.loginInfo.email,
          password: directSignInData.loginInfo.password
        });
        
        if (signInError) {
          console.error('❌ Erreur lors de la connexion côté client:', signInError);
        } else {
          console.log('✅ Connexion côté client réussie!');
          
          // Vérifier la session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log(`   Session active pour: ${session.user.email}`);
            console.log(`   Expire le: ${new Date(session.expires_at * 1000).toLocaleString()}`);
          } else {
            console.log('❌ Aucune session active');
          }
        }
      }
    }

    console.log('\n📝 Recommandations:');
    if (profiles.length > 0) {
      const adminProfile = profiles.find(p => p.is_administrator || p.role === 'admin');
      if (adminProfile) {
        console.log('✅ L\'utilisateur admin est bien mappé');
        console.log('✅ Le système devrait le reconnaître lors de la connexion');
        console.log('✅ Aucune boucle de reconnexion ne devrait se produire');
      } else {
        console.log('⚠️  L\'utilisateur n\'a pas les privilèges admin');
        console.log('💡 Vérifiez que is_administrator=true ou role=admin');
      }
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  } finally {
    rl.close();
  }
}

testAdminMapping();
