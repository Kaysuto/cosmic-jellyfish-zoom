import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

console.log('⚡ Vérification des performances...');

try {
  // Vérifier que le build est à jour
  if (!fs.existsSync('dist')) {
    console.log('📦 Build non trouvé, construction en cours...');
    execSync('npm run build:optimized', { stdio: 'inherit' });
  }

  // Analyser la taille des bundles
  console.log('📊 Analyse des bundles...');
  
  const assetsDir = path.join('dist', 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    const cssFiles = files.filter(file => file.endsWith('.css'));
    
    let totalJsSize = 0;
    let totalCssSize = 0;
    
    jsFiles.forEach(file => {
      const stats = fs.statSync(path.join(assetsDir, file));
      totalJsSize += stats.size;
      console.log(`   📄 ${file}: ${(stats.size / 1024).toFixed(1)} KB`);
    });
    
    cssFiles.forEach(file => {
      const stats = fs.statSync(path.join(assetsDir, file));
      totalCssSize += stats.size;
      console.log(`   🎨 ${file}: ${(stats.size / 1024).toFixed(1)} KB`);
    });
    
    console.log(`\n📈 Résumé des tailles:`);
    console.log(`   - JavaScript total: ${(totalJsSize / 1024).toFixed(1)} KB`);
    console.log(`   - CSS total: ${(totalCssSize / 1024).toFixed(1)} KB`);
    console.log(`   - Total: ${((totalJsSize + totalCssSize) / 1024).toFixed(1)} KB`);
    
    // Recommandations basées sur la taille
    if (totalJsSize > 500 * 1024) {
      console.warn('⚠️ Bundle JavaScript trop volumineux (>500KB)');
      console.log('   💡 Recommandations:');
      console.log('      • Activer le code splitting');
      console.log('      • Utiliser le lazy loading');
      console.log('      • Optimiser les imports');
    }
    
    if (totalCssSize > 100 * 1024) {
      console.warn('⚠️ Bundle CSS trop volumineux (>100KB)');
      console.log('   💡 Recommandations:');
      console.log('      • Purger le CSS inutilisé');
      console.log('      • Utiliser CSS-in-JS');
      console.log('      • Optimiser Tailwind CSS');
    }
  }

  // Vérifier les ressources bloquantes
  console.log('\n🔍 Vérification des ressources bloquantes...');
  
  const htmlFile = path.join('dist', 'index.html');
  if (fs.existsSync(htmlFile)) {
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    // Vérifier les scripts synchrones
    const syncScripts = htmlContent.match(/<script[^>]*src[^>]*>/g);
    if (syncScripts) {
      console.log(`   📜 Scripts synchrones trouvés: ${syncScripts.length}`);
      syncScripts.forEach(script => {
        if (!script.includes('async') && !script.includes('defer')) {
          console.warn(`   ⚠️ Script bloquant: ${script}`);
        }
      });
    }
    
    // Vérifier les CSS externes
    const externalCSS = htmlContent.match(/<link[^>]*rel="stylesheet"[^>]*>/g);
    if (externalCSS) {
      console.log(`   🎨 CSS externes trouvés: ${externalCSS.length}`);
    }
  }

  // Vérifier les images
  console.log('\n🖼️ Vérification des images...');
  
  const imageDirs = ['public', 'src/assets'];
  let imageCount = 0;
  let totalImageSize = 0;
  
  imageDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (/\.(png|jpg|jpeg|gif|webp|avif)$/i.test(file)) {
          const stats = fs.statSync(path.join(dir, file));
          totalImageSize += stats.size;
          imageCount++;
          
          if (stats.size > 500 * 1024) {
            console.warn(`   ⚠️ Image volumineuse: ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
          }
        }
      });
    }
  });
  
  console.log(`   📊 Images trouvées: ${imageCount}`);
  console.log(`   📊 Taille totale: ${(totalImageSize / 1024).toFixed(1)} KB`);

  // Vérifier les chunks
  console.log('\n📦 Vérification du code splitting...');
  
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const chunks = files.filter(file => file.includes('chunk') || file.includes('vendor'));
    
    if (chunks.length > 0) {
      console.log(`   ✅ Code splitting actif: ${chunks.length} chunks`);
      chunks.forEach(chunk => {
        const stats = fs.statSync(path.join(assetsDir, chunk));
        console.log(`      📄 ${chunk}: ${(stats.size / 1024).toFixed(1)} KB`);
      });
    } else {
      console.warn('   ⚠️ Aucun chunk trouvé - code splitting non optimisé');
    }
  }

  // Recommandations générales
  console.log('\n💡 Recommandations de performance:');
  console.log('   • Utilisez npm run optimize-images pour optimiser les images');
  console.log('   • Activez la compression Gzip/Brotli sur le serveur');
  console.log('   • Utilisez un CDN pour les assets statiques');
  console.log('   • Implémentez le service worker pour le cache');
  console.log('   • Optimisez les polices avec font-display: swap');
  console.log('   • Utilisez le composant OptimizedImage pour les images');
  
  console.log('\n🎉 Vérification des performances terminée !');
  
} catch (error) {
  console.error('❌ Erreur lors de la vérification des performances:', error.message);
  process.exit(1);
}
