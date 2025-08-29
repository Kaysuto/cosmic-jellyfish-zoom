const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const SUPABASE_URL = "https://tgffkwoekuaetahrwioo.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_ANON_KEY environment variable is required');
  console.log('💡 Please set it with: export SUPABASE_ANON_KEY="your-anon-key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testGetAllUsers() {
  try {
    console.log('🔍 Test de la fonction Edge get-all-users...');
    
    // Test de la fonction Edge
    const { data, error } = await supabase.functions.invoke('get-all-users');
    
    if (error) {
      console.error('❌ Erreur de la fonction Edge:', error);
      console.error('📋 Détails:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        name: error.name
      });
      return;
    }
    
    if (data?.error) {
      console.error('❌ Erreur retournée par la fonction:', data.error);
      console.error('📋 Détails:', data.details);
      return;
    }
    
    console.log('✅ Fonction Edge exécutée avec succès');
    console.log(`📊 Nombre d'utilisateurs: ${data?.count || 0}`);
    console.log('👥 Utilisateurs:', data?.users?.slice(0, 3) || []);
    
  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
  }
}

// Test direct de la base de données avec le service role
async function testDirectDatabaseAccess() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.log('⚠️ SUPABASE_SERVICE_ROLE_KEY non définie, impossible de tester l\'accès direct');
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
    console.log('👥 Utilisateurs:', users?.slice(0, 3) || []);
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'accès direct:', error);
  }
}

async function main() {
  console.log('🚀 Début des tests...\n');
  
  await testGetAllUsers();
  await testDirectDatabaseAccess();
  
  console.log('\n🏁 Tests terminés');
}

main().catch(console.error);
