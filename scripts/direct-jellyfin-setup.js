import { createClient } from '@supabase/supabase-js';

// Configuration Supabase avec la clé service_role pour contourner RLS
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Variable SUPABASE_SERVICE_ROLE_KEY manquante');
  console.log('💡 Ajoute cette variable d\'environnement ou utilise le script SQL manuel');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function directJellyfinSetup() {
  try {
    console.log('🔧 Configuration directe des paramètres Jellyfin...\n');

    // Paramètres Jellyfin
    const jellyfinUrl = 'https://playjelly.fr';
    const apiKey = '6ad7238735cd431c9384911bcdc3090c';

    console.log(`📝 Configuration :`);
    console.log(`URL: ${jellyfinUrl}`);
    console.log(`API Key: ${apiKey ? '***configurée***' : '❌ manquante'}`);

    // 1. Vérifier et créer la table jellyfin_settings
    console.log('\n1️⃣ Vérification de la table jellyfin_settings...');
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.jellyfin_settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
          url TEXT NOT NULL DEFAULT '',
          api_key TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.log('⚠️ Erreur lors de la création de la table (peut déjà exister):', createError);
    } else {
      console.log('✅ Table jellyfin_settings vérifiée');
    }

    // 2. Mettre à jour les paramètres Jellyfin
    console.log('\n2️⃣ Mise à jour des paramètres Jellyfin...');
    
    const { data: updateData, error: updateError } = await supabase
      .from('jellyfin_settings')
      .upsert({
        id: 1,
        url: jellyfinUrl,
        api_key: apiKey,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select();

    if (updateError) {
      console.log('❌ Erreur lors de la mise à jour:', updateError);
    } else {
      console.log('✅ Paramètres Jellyfin mis à jour avec succès!');
      console.log('Données mises à jour:', updateData);
    }

    // 3. Vérifier les paramètres
    console.log('\n3️⃣ Vérification des paramètres...');
    
    const { data: settings, error: settingsError } = await supabase
      .from('jellyfin_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsError) {
      console.log('❌ Erreur lors de la vérification:', settingsError);
    } else {
      console.log('✅ Paramètres vérifiés:');
      console.log(`  - URL: ${settings.url}`);
      console.log(`  - API Key: ${settings.api_key ? '***configurée***' : '❌ manquante'}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

directJellyfinSetup();
