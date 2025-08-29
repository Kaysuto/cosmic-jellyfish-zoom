import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugImportError() {
  console.log('🔍 Débogage de l\'erreur d\'import...\n');

  try {
    // Test avec un utilisateur simple
    console.log('📊 Test avec utilisateur simple...');
    
    const testData = {
      jellyfin_user_id: 'test-user-123',
      jellyfin_username: 'testuser',
      jellyfin_name: 'Test User',
      password: 'TestPass123!'
    };

    console.log('Données de test:', JSON.stringify(testData, null, 2));

    const { data, error } = await supabase.functions.invoke('import-jellyfin-users', {
      body: testData
    });

    if (error) {
      console.error('❌ Erreur:', error);
      
      // Essayer de récupérer plus de détails
      if (error.context && error.context.body) {
        try {
          const response = await error.context.body.getReader().read();
          const decoder = new TextDecoder();
          const errorText = decoder.decode(response.value);
          console.error('📄 Détails de l\'erreur:', errorText);
        } catch (e) {
          console.error('Impossible de lire les détails de l\'erreur:', e);
        }
      }
    } else if (data.error) {
      console.error('❌ Erreur dans la réponse:', data.error);
    } else {
      console.log('✅ Succès:', data);
    }

    // Test 2: Vérifier si la fonction existe
    console.log('\n📊 Test 2: Vérification de l\'existence de la fonction...');
    
    const { data: listData, error: listError } = await supabase.functions.list();
    
    if (listError) {
      console.error('❌ Erreur lors de la liste des fonctions:', listError);
    } else {
      console.log('✅ Fonctions disponibles:');
      listData.forEach(func => {
        console.log(`   - ${func.name} (${func.status})`);
      });
    }

    // Test 3: Test avec des données minimales
    console.log('\n📊 Test 3: Test avec données minimales...');
    
    const minimalData = {
      jellyfin_user_id: 'minimal-123',
      jellyfin_username: 'minimal',
      jellyfin_name: 'Minimal',
      password: 'pass'
    };

    const { data: minData, error: minError } = await supabase.functions.invoke('import-jellyfin-users', {
      body: minimalData
    });

    if (minError) {
      console.error('❌ Erreur avec données minimales:', minError);
    } else if (minData.error) {
      console.error('❌ Erreur dans la réponse (minimal):', minData.error);
    } else {
      console.log('✅ Succès avec données minimales:', minData);
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

debugImportError();
