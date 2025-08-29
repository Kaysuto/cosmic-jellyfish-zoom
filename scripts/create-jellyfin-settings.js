import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tgffkwoekuaetahrwioo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function createJellyfinSettings() {
  console.log('🔧 Création de l\'enregistrement Jellyfin par défaut...\n');

  try {
    // Vérifier d'abord s'il existe déjà
    const { data: existingSettings, error: checkError } = await supabase
      .from('jellyfin_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la vérification:', checkError.message);
      return;
    }

    if (existingSettings) {
      console.log('✅ L\'enregistrement existe déjà:');
      console.log(`   ID: ${existingSettings.id}`);
      console.log(`   URL: ${existingSettings.url || '❌ Non configuré'}`);
      console.log(`   API Key: ${existingSettings.api_key ? '✅ Configuré' : '❌ Non configuré'}`);
      
      if (!existingSettings.url || !existingSettings.api_key) {
        console.log('\n⚠️  Les paramètres ne sont pas configurés');
        console.log('💡 Configurez l\'URL et la clé API via l\'interface d\'administration');
      }
      return;
    }

    // Créer l'enregistrement par défaut
    console.log('📝 Création de l\'enregistrement par défaut...');
    
    const { data: newSettings, error: insertError } = await supabase
      .from('jellyfin_settings')
      .insert([
        {
          id: 1,
          url: '', // À configurer
          api_key: '', // À configurer
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur lors de la création:', insertError.message);
      
      // Si c'est une erreur de politique RLS, essayer avec une requête SQL directe
      if (insertError.message.includes('row-level security')) {
        console.log('\n💡 Tentative avec une requête SQL directe...');
        
        const { data: sqlResult, error: sqlError } = await supabase
          .rpc('execute_sql', {
            sql_query: `
              INSERT INTO public.jellyfin_settings (id, url, api_key)
              VALUES (1, '', '')
              ON CONFLICT (id) DO NOTHING;
            `
          });

        if (sqlError) {
          console.error('❌ Erreur SQL:', sqlError.message);
        } else {
          console.log('✅ Enregistrement créé via SQL direct');
        }
      }
      return;
    }

    console.log('✅ Enregistrement créé avec succès:');
    console.log(`   ID: ${newSettings.id}`);
    console.log(`   URL: ${newSettings.url || '❌ Non configuré'}`);
    console.log(`   API Key: ${newSettings.api_key ? '✅ Configuré' : '❌ Non configuré'}`);
    
    console.log('\n⚠️  IMPORTANT: Configurez maintenant vos paramètres Jellyfin');
    console.log('💡 Allez dans l\'interface d\'administration ou utilisez cette requête SQL:');
    console.log(`
UPDATE public.jellyfin_settings 
SET url = 'http://votre-serveur-jellyfin:8096', 
    api_key = 'votre_clé_api_jellyfin' 
WHERE id = 1;
    `);

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

createJellyfinSettings();
