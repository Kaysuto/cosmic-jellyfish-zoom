import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkExistingUser() {
  console.log('🔍 Vérification de l\'utilisateur existant...\n');

  try {
    const testEmail = 'testuser@jellyfin.local';
    const testJellyfinId = 'test-user-123';

    // Vérifier par email
    console.log('📊 Vérification par email...');
    const { data: emailUsers, error: emailError } = await supabase
      .from('profiles')
      .select('id, email, jellyfin_user_id, first_name, last_name')
      .eq('email', testEmail);

    if (emailError) {
      console.error('❌ Erreur lors de la vérification par email:', emailError);
    } else {
      console.log('✅ Vérification par email:');
      if (emailUsers && emailUsers.length > 0) {
        emailUsers.forEach(user => {
          console.log(`   - ID: ${user.id}`);
          console.log(`   - Email: ${user.email}`);
          console.log(`   - Jellyfin ID: ${user.jellyfin_user_id}`);
          console.log(`   - Nom: ${user.first_name} ${user.last_name}`);
        });
      } else {
        console.log('   Aucun utilisateur trouvé avec cet email');
      }
    }

    // Vérifier par jellyfin_user_id
    console.log('\n📊 Vérification par jellyfin_user_id...');
    const { data: jellyfinUsers, error: jellyfinError } = await supabase
      .from('profiles')
      .select('id, email, jellyfin_user_id, first_name, last_name')
      .eq('jellyfin_user_id', testJellyfinId);

    if (jellyfinError) {
      console.error('❌ Erreur lors de la vérification par jellyfin_user_id:', jellyfinError);
    } else {
      console.log('✅ Vérification par jellyfin_user_id:');
      if (jellyfinUsers && jellyfinUsers.length > 0) {
        jellyfinUsers.forEach(user => {
          console.log(`   - ID: ${user.id}`);
          console.log(`   - Email: ${user.email}`);
          console.log(`   - Jellyfin ID: ${user.jellyfin_user_id}`);
          console.log(`   - Nom: ${user.first_name} ${user.last_name}`);
        });
      } else {
        console.log('   Aucun utilisateur trouvé avec cet ID Jellyfin');
      }
    }

    // Vérifier tous les utilisateurs avec des emails Jellyfin
    console.log('\n📊 Vérification des utilisateurs avec emails Jellyfin...');
    const { data: allJellyfinUsers, error: allError } = await supabase
      .from('profiles')
      .select('id, email, jellyfin_user_id, first_name, last_name')
      .like('email', '%@jellyfin.local');

    if (allError) {
      console.error('❌ Erreur lors de la vérification des emails Jellyfin:', allError);
    } else {
      console.log('✅ Utilisateurs avec emails Jellyfin:');
      if (allJellyfinUsers && allJellyfinUsers.length > 0) {
        allJellyfinUsers.forEach(user => {
          console.log(`   - ${user.email} (ID: ${user.id}, Jellyfin: ${user.jellyfin_user_id})`);
        });
      } else {
        console.log('   Aucun utilisateur avec email Jellyfin trouvé');
      }
    }

    // Test avec un nouvel utilisateur unique
    console.log('\n📊 Test avec un nouvel utilisateur unique...');
    const uniqueId = `test-${Date.now()}`;
    const uniqueUsername = `testuser${Date.now()}`;
    const uniqueEmail = `${uniqueUsername}@jellyfin.local`;

    console.log(`   ID unique: ${uniqueId}`);
    console.log(`   Username unique: ${uniqueUsername}`);
    console.log(`   Email unique: ${uniqueEmail}`);

    const { data: uniqueData, error: uniqueError } = await supabase.functions.invoke('import-jellyfin-users', {
      body: {
        jellyfin_user_id: uniqueId,
        jellyfin_username: uniqueUsername,
        jellyfin_name: 'Test User Unique',
        password: 'TestPass123!'
      }
    });

    if (uniqueError) {
      console.error('❌ Erreur avec utilisateur unique:', uniqueError);
    } else if (uniqueData.error) {
      console.error('❌ Erreur dans la réponse (unique):', uniqueData.error);
    } else {
      console.log('✅ Succès avec utilisateur unique:', uniqueData);
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkExistingUser();
