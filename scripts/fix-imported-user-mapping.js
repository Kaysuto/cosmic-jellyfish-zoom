import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixImportedUserMapping() {
  console.log('🔧 Correction du mapping des utilisateurs importés...\n');

  // Demander les identifiants à l'utilisateur
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    const username = await question('👤 Nom d\'utilisateur Jellyfin: ');
    const jellyfinUserId = await question('🆔 ID utilisateur Jellyfin (optionnel, appuyez sur Entrée si inconnu): ') || null;
    
    console.log('\n📊 Recherche de l\'utilisateur dans la base de données...');
    
    // Rechercher l'utilisateur par email généré
    const emailToCheck = `${username}@jellyfin.local`;
    console.log(`📧 Recherche par email: ${emailToCheck}`);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', emailToCheck);

    if (profilesError) {
      console.error('❌ Erreur lors de la recherche:', profilesError);
      return;
    }

    if (profiles.length === 0) {
      console.log('❌ Aucun utilisateur trouvé avec cet email');
      console.log('💡 Vérifiez que l\'utilisateur a bien été importé via le panel admin');
      return;
    }

    const profile = profiles[0];
    console.log('\n👤 Utilisateur trouvé:');
    console.log(`   ID: ${profile.id}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Jellyfin User ID: ${profile.jellyfin_user_id || 'Non défini'}`);
    console.log(`   Jellyfin Username: ${profile.jellyfin_username || 'Non défini'}`);
    console.log(`   Auth User ID: ${profile.auth_user_id || 'Non défini'}`);

    // Si l'ID Jellyfin n'est pas fourni, le récupérer via l'API Jellyfin
    let finalJellyfinUserId = jellyfinUserId;
    if (!finalJellyfinUserId) {
      console.log('\n🔍 Récupération de l\'ID Jellyfin via l\'API...');
      
      try {
        const { data: jellyfinData, error: jellyfinError } = await supabase.functions.invoke('jellyfin-login', {
          body: {
            username: username,
            password: 'dummy_password_for_id_lookup' // Mot de passe incorrect pour récupérer l'ID
          }
        });

        if (jellyfinError) {
          console.error('❌ Erreur lors de la récupération de l\'ID Jellyfin:', jellyfinError);
          return;
        }

        if (jellyfinData.error && jellyfinData.error.includes('Invalid Jellyfin credentials')) {
          console.log('✅ Utilisateur trouvé dans Jellyfin, mais mot de passe incorrect');
          console.log('💡 L\'utilisateur existe dans Jellyfin, nous pouvons continuer');
        } else if (jellyfinData.user) {
          finalJellyfinUserId = jellyfinData.user.Id;
          console.log(`✅ ID Jellyfin récupéré: ${finalJellyfinUserId}`);
        }
      } catch (error) {
        console.log('⚠️ Impossible de récupérer l\'ID Jellyfin, utilisation de l\'ID fourni ou existant');
      }
    }

    // Mettre à jour le profil avec les informations Jellyfin
    console.log('\n📝 Mise à jour du profil...');
    
    const updateData = {
      jellyfin_username: username
    };

    if (finalJellyfinUserId) {
      updateData.jellyfin_user_id = finalJellyfinUserId;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      return;
    }

    console.log('✅ Profil mis à jour avec succès!');
    console.log('\n👤 Profil final:');
    console.log(`   ID: ${updatedProfile.id}`);
    console.log(`   Email: ${updatedProfile.email}`);
    console.log(`   Jellyfin User ID: ${updatedProfile.jellyfin_user_id || 'Non défini'}`);
    console.log(`   Jellyfin Username: ${updatedProfile.jellyfin_username || 'Non défini'}`);
    console.log(`   Auth User ID: ${updatedProfile.auth_user_id || 'Non défini'}`);

    console.log('\n🎉 Mapping corrigé!');
    console.log('✅ L\'utilisateur devrait maintenant être reconnu lors de la connexion');
    console.log('✅ Aucun doublon ne sera créé');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  } finally {
    rl.close();
  }
}

fixImportedUserMapping();
