const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const SUPABASE_URL = "https://tgffkwoekuaetahrwioo.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('💡 Please set it with: export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupEdgeFunctionEnvironment() {
  try {
    console.log('🔧 Configuration des variables d\'environnement pour les fonctions Edge...');
    
    // Variables d'environnement nécessaires pour les fonctions Edge
    const envVars = {
      SUPABASE_URL: SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY,
    };
    
    console.log('📋 Variables à configurer:', Object.keys(envVars));
    
    // Note: Les variables d'environnement des fonctions Edge doivent être configurées
    // via le dashboard Supabase ou via l'API de gestion des projets
    console.log('⚠️  Les variables d\'environnement des fonctions Edge doivent être configurées manuellement');
    console.log('📖 Instructions:');
    console.log('1. Allez sur https://supabase.com/dashboard/project/tgffkwoekuaetahrwioo/settings/functions');
    console.log('2. Ajoutez les variables suivantes:');
    console.log(`   - SUPABASE_URL: ${SUPABASE_URL}`);
    console.log(`   - SUPABASE_SERVICE_ROLE_KEY: [votre-clé-de-service]`);
    console.log('3. Redéployez la fonction get-all-users');
    
    // Test de la fonction après configuration
    console.log('\n🧪 Test de la fonction get-all-users...');
    const { data, error } = await supabaseAdmin.functions.invoke('get-all-users');
    
    if (error) {
      console.error('❌ Erreur de la fonction Edge:', error);
      return;
    }
    
    if (data?.error) {
      console.error('❌ Erreur retournée par la fonction:', data.error);
      return;
    }
    
    console.log('✅ Fonction Edge fonctionne correctement');
    console.log(`📊 Nombre d'utilisateurs: ${data?.count || 0}`);
    
  } catch (error) {
    console.error('💥 Erreur lors de la configuration:', error);
  }
}

setupEdgeFunctionEnvironment().catch(console.error);
