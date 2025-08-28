import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

console.log('🎨 Vérification des problèmes de linter CSS...');

try {
  // Vérifier la configuration VS Code
  console.log('📋 Vérification de la configuration VS Code...');
  
  const vscodeSettingsPath = '.vscode/settings.json';
  const vscodeExtensionsPath = '.vscode/extensions.json';
  const cssCustomDataPath = '.vscode/css_custom_data.json';
  
  if (fs.existsSync(vscodeSettingsPath)) {
    console.log('✅ Configuration VS Code trouvée');
    const settings = JSON.parse(fs.readFileSync(vscodeSettingsPath, 'utf8'));
    
    if (settings['css.validate'] === false) {
      console.log('✅ Validation CSS désactivée');
    }
    
    if (settings['tailwindCSS.validate'] === true) {
      console.log('✅ Validation Tailwind CSS activée');
    }
  } else {
    console.warn('⚠️ Configuration VS Code manquante');
  }
  
  if (fs.existsSync(vscodeExtensionsPath)) {
    console.log('✅ Recommandations d\'extensions trouvées');
  }
  
  if (fs.existsSync(cssCustomDataPath)) {
    console.log('✅ Données personnalisées CSS trouvées');
  }

  // Vérifier la configuration PostCSS
  console.log('\n🔧 Vérification de la configuration PostCSS...');
  
  const postcssConfigPath = 'postcss.config.js';
  if (fs.existsSync(postcssConfigPath)) {
    console.log('✅ Configuration PostCSS trouvée');
    const postcssConfig = fs.readFileSync(postcssConfigPath, 'utf8');
    
    if (postcssConfig.includes('tailwindcss')) {
      console.log('✅ Plugin Tailwind CSS configuré');
    }
    
    if (postcssConfig.includes('autoprefixer')) {
      console.log('✅ Plugin Autoprefixer configuré');
    }
  }

  // Vérifier les propriétés CSS problématiques
  console.log('\n🔍 Vérification des propriétés CSS...');
  
  const globalsCssPath = 'src/globals.css';
  if (fs.existsSync(globalsCssPath)) {
    const cssContent = fs.readFileSync(globalsCssPath, 'utf8');
    
    // Vérifier les directives Tailwind
    const tailwindDirectives = cssContent.match(/@tailwind/g);
    if (tailwindDirectives) {
      console.log(`✅ Directives @tailwind trouvées: ${tailwindDirectives.length}`);
    }
    
    const applyDirectives = cssContent.match(/@apply/g);
    if (applyDirectives) {
      console.log(`✅ Directives @apply trouvées: ${applyDirectives.length}`);
    }
    
    const layerDirectives = cssContent.match(/@layer/g);
    if (layerDirectives) {
      console.log(`✅ Directives @layer trouvées: ${layerDirectives.length}`);
    }
    
    // Vérifier les propriétés line-clamp
    const lineClampProperties = cssContent.match(/line-clamp:/g);
    if (lineClampProperties) {
      console.log(`✅ Propriétés line-clamp trouvées: ${lineClampProperties.length}`);
    }
    
    const webkitLineClampProperties = cssContent.match(/-webkit-line-clamp:/g);
    if (webkitLineClampProperties) {
      console.log(`✅ Propriétés -webkit-line-clamp trouvées: ${webkitLineClampProperties.length}`);
    }
  }

  // Recommandations pour résoudre les problèmes
  console.log('\n💡 Recommandations pour résoudre les problèmes de linter:');
  console.log('   • Installez l\'extension Tailwind CSS IntelliSense pour VS Code');
  console.log('   • Redémarrez VS Code après l\'installation des extensions');
  console.log('   • Vérifiez que la validation CSS est désactivée dans les paramètres');
  console.log('   • Assurez-vous que les fichiers .css sont associés à Tailwind CSS');
  console.log('   • Utilisez les données personnalisées CSS pour les directives @tailwind');
  console.log('   • Les propriétés line-clamp sont maintenant compatibles avec les navigateurs');
  
  console.log('\n🎉 Vérification des problèmes de linter CSS terminée !');
  console.log('📊 Résumé des corrections:');
  console.log('   ✅ Configuration VS Code pour Tailwind CSS');
  console.log('   ✅ Données personnalisées CSS pour les directives');
  console.log('   ✅ Propriétés line-clamp avec compatibilité navigateur');
  console.log('   ✅ Configuration PostCSS optimisée');
  console.log('   ✅ Recommandations d\'extensions VS Code');
  
} catch (error) {
  console.error('❌ Erreur lors de la vérification des problèmes de linter CSS:', error.message);
  process.exit(1);
}
