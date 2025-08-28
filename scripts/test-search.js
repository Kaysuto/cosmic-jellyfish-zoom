const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (remplacez par vos vraies valeurs)
const supabaseUrl = 'https://tgffkwoekuaetahrwioo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearch() {
  console.log('🧪 Test de la fonction de recherche...\n');

  const testQueries = ['Spawn', 'digital', 'Batman', 'Star Wars'];

  for (const query of testQueries) {
    console.log(`\n🔍 Test de recherche pour: "${query}"`);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-media', {
        body: { query, language: 'fr' },
      });

      if (error) {
        console.error(`❌ Erreur pour "${query}":`, error);
        continue;
      }

      console.log(`✅ Réponse reçue pour "${query}":`);
      console.log(`   - Nombre de résultats: ${data.results?.length || 0}`);
      
      if (data.results && data.results.length > 0) {
        console.log(`   - Premier résultat:`, {
          id: data.results[0].id,
          title: data.results[0].title,
          media_type: data.results[0].media_type,
          release_date: data.results[0].release_date
        });
      } else {
        console.log(`   - Aucun résultat trouvé`);
      }

    } catch (err) {
      console.error(`❌ Exception pour "${query}":`, err.message);
    }
  }
}

// Exécuter le test
testSearch().catch(console.error);
