#!/usr/bin/env node

/**
 * Script pour nettoyer le cache des modules Vite et résoudre les problèmes de chargement dynamique
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🧹 Nettoyage du cache des modules...');

// Fonctions de nettoyage
const cleanDirectory = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    console.log(`📁 Nettoyage de: ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

const cleanFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    console.log(`📄 Suppression de: ${filePath}`);
    fs.unlinkSync(filePath);
  }
};

try {
  // Nettoyer le cache Vite
  const viteCacheDir = path.join(projectRoot, 'node_modules', '.vite');
  cleanDirectory(viteCacheDir);

  // Nettoyer le cache de build
  const distDir = path.join(projectRoot, 'dist');
  cleanDirectory(distDir);

  // Nettoyer les fichiers de cache potentiels
  const cacheFiles = [
    '.vite',
    '.cache',
    'vite.config.ts.timestamp-*',
    '*.tsbuildinfo'
  ];

  cacheFiles.forEach(pattern => {
    const files = fs.readdirSync(projectRoot, { withFileTypes: true });
    files.forEach(file => {
      if (file.name.includes(pattern.replace('*', ''))) {
        cleanFile(path.join(projectRoot, file.name));
      }
    });
  });

  // Nettoyer le cache du navigateur (fichiers de lock)
  const lockFiles = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml'
  ];

  lockFiles.forEach(lockFile => {
    const lockPath = path.join(projectRoot, lockFile);
    if (fs.existsSync(lockPath)) {
      console.log(`🔒 Suppression du fichier de lock: ${lockFile}`);
      fs.unlinkSync(lockPath);
    }
  });

  console.log('✅ Nettoyage terminé avec succès!');
  console.log('💡 Redémarrez le serveur de développement avec: npm run dev');

} catch (error) {
  console.error('❌ Erreur lors du nettoyage:', error.message);
  process.exit(1);
}
