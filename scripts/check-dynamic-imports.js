#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour lire récursivement les fichiers
function readFilesRecursively(dir, fileExtensions = ['.tsx', '.ts', '.js', '.jsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && fileExtensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Fonction pour analyser les imports dynamiques
function analyzeDynamicImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Rechercher les imports dynamiques avec lazy()
    const lazyMatch = line.match(/lazy\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*["']([^"']+)["']\s*\)\s*\)/);
    if (lazyMatch) {
      const importPath = lazyMatch[1];
      
      // Vérifier si le chemin utilise l'alias @/ (problématique pour les imports dynamiques avec Vite)
      if (importPath.startsWith('@/')) {
        issues.push({
          line: lineNumber,
          path: importPath,
          type: 'alias_in_dynamic_import',
          suggestion: importPath.replace('@/', './')
        });
      }
    }
    
    // Rechercher les imports dynamiques directs (uniquement pour les modules React)
    const directMatch = line.match(/import\s*\(\s*["']([^"']+)["']\s*\)/);
    if (directMatch && !line.includes('lazy') && !line.includes('.json')) {
      const importPath = directMatch[1];
      
             // Ignorer les imports de fichiers JSON et autres assets
       if (!importPath.endsWith('.json') && 
           !importPath.endsWith('.css') && 
           !importPath.endsWith('.svg') && 
           !importPath.endsWith('.png') && 
           !importPath.endsWith('.jpg') && 
           !importPath.endsWith('.jpeg') && 
           !importPath.endsWith('.gif') && 
           !importPath.endsWith('.webp') &&
           !importPath.startsWith('http') && 
           !importPath.startsWith('data:')) {
        issues.push({
          line: lineNumber,
          path: importPath,
          type: 'direct_import',
          suggestion: importPath.startsWith('./') ? importPath.replace('./', '@/') : `@/${importPath}`
        });
      }
    }
  }
  
  return issues;
}

// Fonction principale
function main() {
  console.log('🔍 Vérification des imports dynamiques...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const files = readFilesRecursively(srcDir);
  
  let totalIssues = 0;
  let filesWithIssues = 0;
  
  for (const file of files) {
    const issues = analyzeDynamicImports(file);
    
    if (issues.length > 0) {
      filesWithIssues++;
      const relativePath = path.relative(process.cwd(), file);
      console.log(`📁 ${relativePath}:`);
      
      for (const issue of issues) {
        totalIssues++;
        console.log(`  Ligne ${issue.line}: ${issue.path} (${issue.type})`);
        console.log(`    💡 Suggestion: ${issue.suggestion}`);
      }
      console.log('');
    }
  }
  
     if (totalIssues === 0) {
     console.log('✅ Aucun problème d\'import dynamique détecté !');
     console.log('🎉 Tous les imports dynamiques utilisent des chemins relatifs');
   } else {
     console.log(`⚠️  ${totalIssues} problème(s) détecté(s) dans ${filesWithIssues} fichier(s)`);
     console.log('\n💡 Recommandations:');
     console.log('  - Utilisez des chemins relatifs (./) pour les imports dynamiques');
     console.log('  - Évitez l\'alias @/ dans les imports lazy() avec Vite');
     console.log('  - Testez les imports en mode développement et production');
   }
  
  return totalIssues;
}

// Exécuter le script
const exitCode = main();
process.exit(exitCode > 0 ? 1 : 0);

export { analyzeDynamicImports, readFilesRecursively };
