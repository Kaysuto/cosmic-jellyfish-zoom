import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0OTcyOTAsImV4cCI6MjA1MTA3MzI5MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupJellyfinSettings() {
  try {
    console.log('🔧 Configuration des paramètres Jellyfin...\n');

    // Demander les paramètres à l'utilisateur
    console.log('Veuillez entrer vos paramètres Jellyfin :');
    console.log('(Appuyez sur Entrée pour utiliser les valeurs par défaut)');
    
    // Pour l'exemple, on utilise des valeurs par défaut
    const jellyfinUrl = 'https://playjelly.fr'; // URL de ton serveur Jellyfin
    const apiKey = '6ad7238735cd431c9384911bcdc3090c'; // Clé API de ton serveur Jellyfin

    console.log(`\n📝 Configuration :`);
    console.log(`URL: ${jellyfinUrl}`);
    console.log(`API Key: ${apiKey ? '***configurée***' : '❌ manquante'}`);

    if (!apiKey || apiKey === 'your-api-key-here') {
      console.log('\n❌ Veuillez configurer une API Key valide dans le script');
      console.log('Instructions :');
      console.log('1. Va dans ton serveur Jellyfin > Dashboard > Advanced > API Keys');
      console.log('2. Crée une nouvelle clé API');
      console.log('3. Remplace "your-api-key-here" dans ce script');
      return;
    }

    // Configurer les paramètres via la fonction Edge
    console.log('\n⚙️ Configuration via la fonction Edge...');
    
    const { data, error } = await supabase.functions.invoke('setup-jellyfin-settings', {
      body: {
        url: jellyfinUrl,
        api_key: apiKey
      }
    });

    if (error) {
      console.log('❌ Erreur lors de la configuration:', error);
    } else {
      console.log('✅ Paramètres Jellyfin configurés avec succès!');
      console.log('Réponse:', data);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

setupJellyfinSettings();
