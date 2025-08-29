// Script pour vérifier la structure de la base de données
// À exécuter avec: node scripts/check-database-structure.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseStructure() {
  console.log('🔍 Vérification de la structure de la base de données...\n');

  try {
    // 1. Vérifier la table profiles
    console.log('📋 Vérification de la table profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('❌ Erreur lors de la récupération des profils:', profilesError);
    } else {
      console.log(`✅ Table profiles accessible, ${profiles?.length || 0} profils trouvés`);
      if (profiles && profiles.length > 0) {
        console.log('📝 Exemple de profil:', {
          id: profiles[0].id,
          email: profiles[0].email,
          role: profiles[0].role,
          jellyfin_user_id: profiles[0].jellyfin_user_id
        });
      }
    }

    // 2. Vérifier les politiques RLS
    console.log('\n🔐 Vérification des politiques RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'profiles' });

    if (policiesError) {
      console.log('⚠️ Impossible de récupérer les politiques RLS (normal si la fonction n\'existe pas)');
    } else {
      console.log('✅ Politiques RLS récupérées:', policies);
    }

    // 3. Vérifier la table jellyfin_settings
    console.log('\n🎬 Vérification de la table jellyfin_settings...');
    const { data: jellyfinSettings, error: jellyfinError } = await supabase
      .from('jellyfin_settings')
      .select('*');

    if (jellyfinError) {
      console.error('❌ Erreur lors de la récupération des paramètres Jellyfin:', jellyfinError);
    } else {
      console.log(`✅ Table jellyfin_settings accessible, ${jellyfinSettings?.length || 0} enregistrements trouvés`);
    }

    // 4. Vérifier les utilisateurs avec le rôle admin
    console.log('\n👑 Vérification des administrateurs...');
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('id, email, role, first_name, last_name')
      .eq('role', 'admin');

    if (adminsError) {
      console.error('❌ Erreur lors de la récupération des admins:', adminsError);
    } else {
      console.log(`✅ ${admins?.length || 0} administrateur(s) trouvé(s):`);
      admins?.forEach(admin => {
        console.log(`   - ${admin.first_name} ${admin.last_name} (${admin.email})`);
      });
    }

    // 5. Vérifier les utilisateurs mappés avec Jellyfin
    console.log('\n🔗 Vérification des utilisateurs mappés Jellyfin...');
    const { data: mappedUsers, error: mappedError } = await supabase
      .from('profiles')
      .select('id, email, jellyfin_user_id, jellyfin_username')
      .not('jellyfin_user_id', 'is', null);

    if (mappedError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs mappés:', mappedError);
    } else {
      console.log(`✅ ${mappedUsers?.length || 0} utilisateur(s) mappé(s) avec Jellyfin:`);
      mappedUsers?.forEach(user => {
        console.log(`   - ${user.email} -> Jellyfin ID: ${user.jellyfin_user_id}`);
      });
    }

  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

checkDatabaseStructure().then(() => {
  console.log('\n✅ Vérification terminée');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
