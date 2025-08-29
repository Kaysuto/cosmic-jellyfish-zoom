const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const SUPABASE_URL = "https://tgffkwoekuaetahrwioo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testGetAllUsers() {
  try {
    console.log('🔍 Test de la fonction Edge get-all-users...');
    console.log('📋 URL:', SUPABASE_URL);
    console.log('🔑 Clé utilisée:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    // Test de la fonction Edge
    const { data, error } = await supabase.functions.invoke('get-all-users');
    
    if (error) {
      console.error('❌ Erreur de la fonction Edge:', error);
      console.error('📋 Détails complets:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        name: error.name,
        stack: error.stack
      });
      
      // Suggestions de résolution
      if (error.message?.includes('non-2xx status code')) {
        console.log('\n💡 Suggestion de résolution:');
        console.log('1. Vérifiez que les variables d\'environnement sont configurées dans le dashboard Supabase');
        console.log('2. Redéployez la fonction Edge');
        console.log('3. Vérifiez les logs de la fonction dans le dashboard');
      }
      
      return;
    }
    
    if (data?.error) {
      console.error('❌ Erreur retournée par la fonction:', data.error);
      console.error('📋 Détails:', data.details);
      console.error('📋 Code:', data.code);
      
      // Suggestions de résolution
      if (data.error?.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        console.log('\n💡 Suggestion de résolution:');
        console.log('1. Allez sur https://supabase.com/dashboard/project/tgffkwoekuaetahrwioo/settings/functions');
        console.log('2. Ajoutez la variable SUPABASE_SERVICE_ROLE_KEY');
        console.log('3. Redéployez la fonction');
      }
      
      return;
    }
    
    console.log('✅ Fonction Edge exécutée avec succès');
    console.log(`📊 Nombre d'utilisateurs: ${data?.count || 0}`);
    console.log('👥 Utilisateurs (premiers 3):', data?.users?.slice(0, 3) || []);
    
  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
  }
}

// Test direct de la base de données avec le service role
async function testDirectDatabaseAccess() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n⚠️ SUPABASE_SERVICE_ROLE_KEY non définie, impossible de tester l\'accès direct');
    console.log('💡 Pour tester l\'accès direct, définissez la variable d\'environnement:');
    console.log('   export SUPABASE_SERVICE_ROLE_KEY="votre-clé-de-service"');
    return;
  }
  
  try {
    console.log('\n🔍 Test d\'accès direct à la base de données...');
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erreur d\'accès direct:', error);
      return;
    }
    
    console.log('✅ Accès direct réussi');
    console.log(`📊 Nombre d'utilisateurs: ${users?.length || 0}`);
    console.log('👥 Utilisateurs (premiers 3):', users?.slice(0, 3) || []);
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'accès direct:', error);
  }
}

// Test de la fonction Edge avec gestion d'erreur détaillée
async function testEdgeFunctionWithDetails() {
  try {
    console.log('\n🔍 Test détaillé de la fonction Edge...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-all-users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 Statut de la réponse:', response.status);
    console.log('📋 Headers de la réponse:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Corps de la réponse:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Réponse JSON valide:', data);
      } catch (e) {
        console.log('⚠️ Réponse non-JSON:', responseText);
      }
    } else {
      console.error('❌ Erreur HTTP:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test détaillé:', error);
  }
}

async function main() {
  console.log('🚀 Début des tests améliorés...\n');
  
  await testGetAllUsers();
  await testDirectDatabaseAccess();
  await testEdgeFunctionWithDetails();
  
  console.log('\n🏁 Tests terminés');
  console.log('\n📖 Prochaines étapes:');
  console.log('1. Si la fonction Edge échoue, configurez les variables d\'environnement');
  console.log('2. Si l\'accès direct fonctionne, le problème est dans la fonction Edge');
  console.log('3. Vérifiez les logs de la fonction dans le dashboard Supabase');
}

main().catch(console.error);
