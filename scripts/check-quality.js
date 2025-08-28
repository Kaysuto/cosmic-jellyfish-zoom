import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

console.log('🔍 Vérification de la qualité du code...');

try {
  // Vérifier la syntaxe avec ESLint
  console.log('📝 Vérification ESLint...');
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ ESLint passé');

  // Vérifier les erreurs TypeScript
  console.log('🔧 Vérification TypeScript...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript passé');

  // Vérifier les fichiers de build
  if (fs.existsSync('dist')) {
    console.log('📦 Vérification des fichiers de build...');
    
    const assetsDir = path.join('dist', 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      const jsFiles = files.filter(file => file.endsWith('.js'));
      const sourceMaps = files.filter(file => file.endsWith('.js.map'));
      
      console.log(`📊 Statistiques de build:`);
      console.log(`   - Fichiers JS: ${jsFiles.length}`);
      console.log(`   - Source maps: ${sourceMaps.length}`);
      
      if (sourceMaps.length === 0) {
        console.warn('⚠️ Aucune source map trouvée - utilisez npm run build:optimized');
      }
    }
  }

  // Vérifier les dépendances
  console.log('📋 Vérification des dépendances...');
  execSync('npm audit --audit-level moderate', { stdio: 'inherit' });
  console.log('✅ Audit de sécurité passé');

  console.log('🎉 Toutes les vérifications de qualité sont passées !');
  
} catch (error) {
  console.error('❌ Erreur lors de la vérification:', error.message);
  process.exit(1);
}
