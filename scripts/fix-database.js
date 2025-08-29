#!/usr/bin/env node

/**
 * Script de diagnostic et correction de la base de données
 * Usage: node scripts/fix-database.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tgffkwoekuaetahrwioo.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY non définie dans les variables d\'environnement');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const checkTable = async (tableName) => {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        name: tableName,
        exists: false,
        error: error.message,
      };
    }

    return {
      name: tableName,
      exists: true,
      rowCount: count || 0,
    };
  } catch (err) {
    return {
      name: tableName,
      exists: false,
      error: err instanceof Error ? err.message : 'Erreur inconnue',
    };
  }
};

const runDiagnostic = async () => {
  console.log('🔍 Diagnostic de la base de données...\n');

  const tablesToCheck = [
    'logs',
    'audit_logs', 
    'profiles',
    'services',
    'incidents',
    'media_requests',
    'catalog_items',
    'jellyfin_settings',
    'settings',
    'notifications'
  ];

  const results = await Promise.all(
    tablesToCheck.map(table => checkTable(table))
  );

  console.log('📊 Résultats du diagnostic:\n');

  let missingTables = [];
  let healthyTables = [];

  results.forEach(result => {
    if (result.exists) {
      console.log(`✅ ${result.name} - OK (${result.rowCount} enregistrements)`);
      healthyTables.push(result.name);
    } else {
      console.log(`❌ ${result.name} - MANQUANTE (${result.error})`);
      missingTables.push(result.name);
    }
  });

  console.log(`\n📈 Résumé: ${healthyTables.length} tables OK, ${missingTables.length} tables manquantes\n`);

  return { results, missingTables, healthyTables };
};

const fixLogsTable = async () => {
  console.log('🔧 Correction de la table logs...\n');

  try {
    // Lire le script SQL
    const scriptPath = path.join(__dirname, 'fix-logs-table.sql');
    const sqlScript = fs.readFileSync(scriptPath, 'utf8');

    console.log('📝 Exécution du script de correction...');
    
    // Exécuter le script SQL via l'API Supabase
    // Note: Cette approche nécessite des permissions admin
    // En pratique, il faut exécuter le script manuellement dans le SQL Editor
    
    console.log('⚠️  Le script doit être exécuté manuellement dans le Supabase SQL Editor');
    console.log('📁 Fichier: scripts/fix-logs-table.sql');
    
    return false;
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
    return false;
  }
};

const main = async () => {
  try {
    console.log('🚀 Démarrage du diagnostic de base de données\n');
    
    const { missingTables } = await runDiagnostic();

    if (missingTables.length === 0) {
      console.log('🎉 Toutes les tables sont présentes ! La base de données est saine.');
      return;
    }

    console.log('⚠️  Tables manquantes détectées. Tentative de correction...\n');

    if (missingTables.includes('logs')) {
      await fixLogsTable();
    }

    console.log('\n📋 Actions recommandées:');
    console.log('1. Ouvrez le Supabase Dashboard');
    console.log('2. Allez dans SQL Editor');
    console.log('3. Copiez et exécutez le contenu de scripts/fix-logs-table.sql');
    console.log('4. Relancez ce script pour vérifier la correction');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    process.exit(1);
  }
};

main();
