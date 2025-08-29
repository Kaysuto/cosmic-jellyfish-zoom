#!/usr/bin/env node

/**
 * Script de nettoyage pour supprimer les fichiers temporaires
 * Usage: node scripts/cleanup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToDelete = [
  'dist',
  'dist-static',
  'plesk-package.zip',
  'pnpm-lock.yaml'
];

const tempDocsToDelete = [
  'FIX_404_INSTRUCTIONS.md',
  'NAVBAR_HOOK_OPTIMIZATION.md',
  'ANIMATION_OPTIMIZATION.md',
  'DYNAMIC_IMPORT_FIX_SUMMARY.md',
  'MODULE_LOAD_ERROR_FIX.md',
  'ERROR_PAGES.md',
  'JELLYFIN_SETUP.md',
  'I18N_MIGRATION.md',
  'TURNSTILE_SETUP.md',
  'CATALOG_RESTRUCTURING.md'
];

const tempScriptsToDelete = [
  'debug-request-performance.sql',
  'test-media-detail-button.sql',
  'test-request-button-update.sql',
  'test-duplicate-prevention.sql',
  'test-constraint.sql',
  'test-request-status.sql',
  'fix-notification-read-status.sql',
  'complete-notifications-fix.sql',
  'fix-notifications-for-multiple-admins.sql',
  'apply-simplified-rls.sql',
  'simplify-notifications-rls.sql',
  'debug-notifications.sql',
  'fix-notifications-rls-admin.sql',
  'fix-notifications-rls.sql',
  'update-notification-trigger.sql',
  'update-existing-notifications.sql',
  'fix-database-issues.sql',
  'apply-auth-fix.sql',
  'apply-fix-404.cjs',
  'fix-all-404-errors.sql',
  'test-jellyfin-items-complete.js',
  'test-jellyfin-items.js',
  'test-jellyfin-endpoints.js',
  'test-jellyfin-proxy-params.js',
  'debug-jellyfin-proxy.js',
  'test-simple-query.js',
  'clean-cache.cjs',
  'check-dynamic-imports.js',
  'test-search.js',
  'deploy-search.js',
  'check-button-accessibility.js',
  'check-css-lint.js',
  'check-accessibility.js',
  'check-performance.js',
  'optimize-images.js',
  'check-quality.js'
];

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`🗑️  Dossier supprimé: ${filePath}`);
      } else {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Fichier supprimé: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression de ${filePath}:`, error.message);
  }
}

function cleanup() {
  console.log('🧹 Début du nettoyage...\n');

  // Supprimer les fichiers et dossiers temporaires
  filesToDelete.forEach(file => {
    deleteFile(file);
  });

  // Supprimer les fichiers de documentation temporaires
  tempDocsToDelete.forEach(doc => {
    deleteFile(doc);
  });

  // Supprimer les scripts temporaires
  tempScriptsToDelete.forEach(script => {
    deleteFile(path.join('scripts', script));
  });

  console.log('\n✅ Nettoyage terminé !');
  console.log('\n📁 Fichiers conservés:');
  console.log('  - Scripts de production (build-production.js, build-static.js, etc.)');
  console.log('  - Configuration Supabase');
  console.log('  - Fichiers de configuration du projet');
  console.log('  - Code source (src/)');
  console.log('  - Assets publics (public/)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  cleanup();
}

export { cleanup };
