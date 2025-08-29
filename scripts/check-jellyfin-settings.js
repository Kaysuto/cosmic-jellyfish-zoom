import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tgffkwoekuaetahrwioo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkJellyfinSettings() {
  console.log('🔍 Vérification des paramètres Jellyfin...\n');

  try {
    // D'abord, lister tous les enregistrements
    const { data: allSettings, error: listError } = await supabase
      .from('jellyfin_settings')
      .select('*');

    if (listError) {
      console.error('❌ Erreur lors de la récupération des paramètres:', listError.message);
      return;
    }

    console.log(`📊 Nombre d'enregistrements trouvés: ${allSettings.length}`);

    if (allSettings.length === 0) {
      console.log('❌ Aucun paramètre Jellyfin trouvé dans la base de données');
      console.log('💡 L\'enregistrement par défaut devrait être créé automatiquement par les migrations');
      console.log('   Vérifiez que les migrations ont été appliquées correctement');
      return;
    }

    // Afficher tous les enregistrements
    allSettings.forEach((setting, index) => {
      console.log(`\n📋 Enregistrement ${index + 1}:`);
      console.log(`   ID: ${setting.id}`);
      console.log(`   URL: ${setting.url || '❌ Non configuré'}`);
      console.log(`   API Key: ${setting.api_key ? '✅ Configuré' : '❌ Non configuré'}`);
      console.log(`   Créé le: ${setting.created_at}`);
      console.log(`   Mis à jour le: ${setting.updated_at}`);
    });

    // Chercher l'enregistrement avec id=1
    const settings = allSettings.find(s => s.id === 1);
    
    if (!settings) {
      console.log('\n⚠️  Aucun enregistrement avec id=1 trouvé');
      console.log('💡 La fonction jellyfin-auth cherche spécifiquement l\'enregistrement avec id=1');
      return;
    }

    if (!settings.url || !settings.api_key) {
      console.log('\n⚠️  Les paramètres Jellyfin ne sont pas complètement configurés');
      console.log('   Assurez-vous que l\'URL et la clé API sont définis');
      console.log('\n💡 Pour configurer les paramètres, utilisez l\'interface d\'administration');
      console.log('   ou mettez à jour directement dans la base de données :');
      console.log(`   UPDATE jellyfin_settings SET url = 'votre_url_jellyfin', api_key = 'votre_clé_api' WHERE id = 1;`);
    } else {
      console.log('\n✅ Configuration Jellyfin complète');
      
      // Test de connectivité
      console.log('\n🔗 Test de connectivité vers Jellyfin...');
      try {
        const response = await fetch(`${settings.url}/System/Info`, {
          headers: {
            'X-Emby-Token': settings.api_key,
          }
        });
        
        if (response.ok) {
          const systemInfo = await response.json();
          console.log('✅ Connexion Jellyfin réussie');
          console.log(`   Version: ${systemInfo.Version || 'Inconnue'}`);
          console.log(`   Nom du serveur: ${systemInfo.ServerName || 'Inconnu'}`);
        } else {
          console.log(`❌ Erreur de connexion Jellyfin: ${response.status} ${response.statusText}`);
        }
      } catch (fetchError) {
        console.log(`❌ Erreur de connectivité: ${fetchError.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

checkJellyfinSettings();
