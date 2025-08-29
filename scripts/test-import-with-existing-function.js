import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testImportWithExistingFunction() {
  console.log('🎯 Test de l\'import avec la fonction existante...\n');

  try {
    // Test avec un utilisateur unique
    const uniqueId = `test-${Date.now()}`;
    const uniqueUsername = `testuser${Date.now()}`;
    const uniqueEmail = `${uniqueUsername}@jellyfin.local`;

    console.log(`📊 Test avec utilisateur unique:`);
    console.log(`   ID: ${uniqueId}`);
    console.log(`   Username: ${uniqueUsername}`);
    console.log(`   Email: ${uniqueEmail}`);

    const { data, error } = await supabase.functions.invoke('create-jellyfin-user-account', {
      body: {
        jellyfin_user_id: uniqueId,
        email: uniqueEmail,
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User'
      }
    });

    if (error) {
      console.error('❌ Erreur:', error);
    } else if (data.error) {
      console.error('❌ Erreur dans la réponse:', data.error);
    } else {
      console.log('✅ Succès!');
      console.log(`   Utilisateur créé: ${data.user.email}`);
      console.log(`   ID: ${data.user.id}`);
      console.log(`   Jellyfin User ID: ${data.user.jellyfin_user_id}`);
    }

    // Test avec un vrai utilisateur Jellyfin
    console.log('\n📊 Test avec un vrai utilisateur Jellyfin...');
    
    const { data: jellyfinUsers, error: jellyfinError } = await supabase.functions.invoke('jellyfin-proxy', {
      body: { endpoint: 'Users' }
    });

    if (jellyfinError || jellyfinUsers.error) {
      console.error('❌ Erreur jellyfin-proxy:', jellyfinError || jellyfinUsers.error);
    } else if (jellyfinUsers && jellyfinUsers.length > 0) {
      const testUser = jellyfinUsers[0];
      console.log(`   Utilisateur Jellyfin: ${testUser.Name} (ID: ${testUser.Id})`);

      // Vérifier si l'utilisateur existe déjà
      const { data: existingUsers, error: existingError } = await supabase
        .from('profiles')
        .select('id, email, jellyfin_user_id')
        .eq('jellyfin_user_id', testUser.Id);

      if (existingError) {
        console.error('❌ Erreur lors de la vérification:', existingError);
      } else if (existingUsers && existingUsers.length > 0) {
        console.log('⚠️  Utilisateur déjà existant dans l\'app');
        console.log(`   Email: ${existingUsers[0].email}`);
      } else {
        console.log('✅ Utilisateur non trouvé, test d\'import...');
        
        const { data: importData, error: importError } = await supabase.functions.invoke('create-jellyfin-user-account', {
          body: {
            jellyfin_user_id: testUser.Id,
            email: `${testUser.Name}@jellyfin.local`,
            password: 'TestPass123!',
            first_name: testUser.Name.split(' ')[0] || testUser.Name,
            last_name: testUser.Name.split(' ').slice(1).join(' ') || ''
          }
        });

        if (importError) {
          console.error('❌ Erreur import:', importError);
        } else if (importData.error) {
          console.error('❌ Erreur dans la réponse import:', importData.error);
        } else {
          console.log('✅ Import réussi!');
          console.log(`   Utilisateur créé: ${importData.user.email}`);
          console.log(`   ID: ${importData.user.id}`);
        }
      }
    } else {
      console.log('⚠️  Aucun utilisateur Jellyfin trouvé');
    }

    console.log('\n🎉 Test terminé !');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testImportWithExistingFunction();
