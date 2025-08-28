import { execSync } from 'child_process';
import fs from 'fs-extra';

console.log('🚀 Déploiement et test de la fonction de recherche TMDB...');

try {
  // Vérifier que Supabase CLI est installé
  console.log('📋 Vérification de Supabase CLI...');
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    console.log('✅ Supabase CLI installé');
  } catch (error) {
    console.error('❌ Supabase CLI non installé. Installez-le avec: npm install -g supabase');
    process.exit(1);
  }

  // Déployer la fonction search-media
  console.log('\n📦 Déploiement de la fonction search-media...');
  try {
    execSync('supabase functions deploy search-media', { stdio: 'inherit' });
    console.log('✅ Fonction search-media déployée');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement:', error.message);
    console.log('💡 Assurez-vous d\'être connecté à Supabase: supabase login');
    process.exit(1);
  }

  // Vérifier la configuration des variables d'environnement
  console.log('\n🔧 Vérification des variables d\'environnement...');
  try {
    const envOutput = execSync('supabase secrets list', { stdio: 'pipe' }).toString();
    if (envOutput.includes('TMDB_API_KEY')) {
      console.log('✅ Variable TMDB_API_KEY configurée');
    } else {
      console.warn('⚠️ Variable TMDB_API_KEY non configurée');
      console.log('💡 Configurez-la avec: supabase secrets set TMDB_API_KEY=your_api_key');
    }
  } catch (error) {
    console.warn('⚠️ Impossible de vérifier les variables d\'environnement');
  }

  // Recommandations pour tester
  console.log('\n💡 Pour tester la recherche:');
  console.log('   • Redémarrez l\'application: npm run dev');
  console.log('   • Allez sur la page catalogue: /catalog');
  console.log('   • Tapez un terme de recherche (ex: "Batman", "Breaking Bad")');
  console.log('   • Vérifiez les logs dans le dashboard Supabase');
  console.log('   • Ouvrez la console du navigateur pour voir les logs');
  
  console.log('\n🎉 Déploiement terminé !');
  console.log('📊 Résumé:');
  console.log('   ✅ Fonction search-media déployée');
  console.log('   ✅ Structure de réponse corrigée');
  console.log('   ✅ Logs de débogage ajoutés');
  console.log('   ✅ Traductions ajoutées');
  
} catch (error) {
  console.error('❌ Erreur lors du déploiement:', error.message);
  process.exit(1);
}
