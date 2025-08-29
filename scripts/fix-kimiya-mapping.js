import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixKimiyaMapping() {
  console.log('🔧 Correction du mapping pour l\'utilisateur Kimiya...\n');

  try {
    // Rechercher l'utilisateur Kimiya
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'kimiya@jellyfin.local');

    if (profilesError) {
      console.error('❌ Erreur lors de la recherche:', profilesError);
      return;
    }

    if (profiles.length === 0) {
      console.log('❌ Utilisateur Kimiya non trouvé');
      return;
    }

    const profile = profiles[0];
    console.log('👤 Utilisateur Kimiya trouvé:');
    console.log(`   ID: ${profile.id}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Jellyfin User ID: ${profile.jellyfin_user_id || 'Non défini'}`);
    console.log(`   Jellyfin Username: ${profile.jellyfin_username || 'Non défini'}`);

    // Récupérer l'ID Jellyfin via l'API
    console.log('\n🔍 Récupération de l\'ID Jellyfin...');
    
    const { data: jellyfinData, error: jellyfinError } = await supabase.functions.invoke('jellyfin-login', {
      body: {
        username: 'Kimiya',
        password: 'dummy_password_for_id_lookup'
      }
    });

    if (jellyfinError) {
      console.error('❌ Erreur lors de la récupération de l\'ID Jellyfin:', jellyfinError);
      return;
    }

    if (jellyfinData.error && jellyfinData.error.includes('Invalid Jellyfin credentials')) {
      console.log('✅ Utilisateur Kimiya trouvé dans Jellyfin');
      console.log('💡 L\'utilisateur existe, nous pouvons corriger le mapping');
    } else if (jellyfinData.user) {
      console.log(`✅ ID Jellyfin récupéré: ${jellyfinData.user.Id}`);
      
      // Mettre à jour le profil
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          jellyfin_user_id: jellyfinData.user.Id,
          jellyfin_username: 'Kimiya'
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour:', updateError);
        return;
      }

      console.log('✅ Mapping corrigé avec succès!');
      console.log('\n👤 Profil final:');
      console.log(`   ID: ${updatedProfile.id}`);
      console.log(`   Email: ${updatedProfile.email}`);
      console.log(`   Jellyfin User ID: ${updatedProfile.jellyfin_user_id}`);
      console.log(`   Jellyfin Username: ${updatedProfile.jellyfin_username}`);

      console.log('\n🎉 Kimiya peut maintenant se connecter!');
      console.log('✅ Le système reconnaîtra l\'utilisateur existant');
      console.log('✅ Aucun doublon ne sera créé');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

fixKimiyaMapping();
