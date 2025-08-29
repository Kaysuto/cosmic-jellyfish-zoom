import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE5NzQsImV4cCI6MjA1MDU0Nzk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImportJellyfinUser() {
  console.log('🧪 Test de la fonction import-jellyfin-users...');
  
  const testData = {
    jellyfin_user_id: 'test-user-123',
    jellyfin_username: 'testuser',
    jellyfin_name: 'Test User',
    password: 'TestPassword123!'
  };
  
  console.log('📤 Données envoyées:', testData);
  
  try {
    const { data, error } = await supabase.functions.invoke('import-jellyfin-users', {
      body: testData
    });
    
    if (error) {
      console.error('❌ Erreur:', error);
      
      // Essayer de récupérer le corps de la réponse
      if (error.context && error.context.body) {
        try {
          const reader = error.context.body.getReader();
          const { value } = await reader.read();
          const responseBody = new TextDecoder().decode(value);
          console.error('📋 Corps de la réponse:', responseBody);
        } catch (e) {
          console.error('❌ Impossible de lire le corps de la réponse:', e);
        }
      }
      return;
    }
    
    if (data.error) {
      console.error('❌ Erreur de la fonction:', data.error);
      if (data.details) {
        console.error('📋 Détails:', data.details);
      }
      return;
    }
    
    console.log('✅ Succès:', data);
    
  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
  }
}

// Exécuter le test
testImportJellyfinUser();
