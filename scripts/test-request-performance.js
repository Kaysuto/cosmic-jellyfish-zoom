#!/usr/bin/env node

/**
 * Script de test des performances des requêtes de demandes
 * Usage: node scripts/test-request-performance.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration (à adapter selon votre environnement)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tgffkwoekuaetahrwioo.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRequestPerformance() {
  console.log('🧪 Test des performances des requêtes de demandes...\n');

  try {
    // 1. Test de récupération de toutes les demandes d'un utilisateur
    console.log('1. Test de récupération de toutes les demandes...');
    const startTime = Date.now();
    
    const { data: allRequests, error: allRequestsError } = await supabase
      .from('media_requests')
      .select('tmdb_id, title, media_type, status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(100);

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (allRequestsError) {
      console.error('❌ Erreur lors de la récupération:', allRequestsError);
      return;
    }

    console.log(`✅ Récupération réussie en ${duration}ms`);
    console.log(`📊 Nombre de demandes récupérées: ${allRequests.length}`);

    // 2. Test avec des IDs spécifiques (simulation de l'ancienne approche)
    if (allRequests.length > 0) {
      console.log('\n2. Test avec des IDs spécifiques (approche .in())...');
      const testIds = allRequests.slice(0, 10).map(req => req.tmdb_id);
      
      const startTime2 = Date.now();
      
      const { data: specificRequests, error: specificError } = await supabase
        .from('media_requests')
        .select('tmdb_id')
        .in('tmdb_id', testIds);

      const endTime2 = Date.now();
      const duration2 = endTime2 - startTime2;

      if (specificError) {
        console.error('❌ Erreur avec .in():', specificError);
      } else {
        console.log(`✅ Requête .in() réussie en ${duration2}ms`);
        console.log(`📊 IDs testés: ${testIds.length}, Résultats: ${specificRequests.length}`);
      }
    }

    // 3. Statistiques des demandes
    console.log('\n3. Statistiques des demandes...');
    
    const stats = {
      total: allRequests.length,
      byStatus: {},
      byMediaType: {},
      recent: allRequests.filter(req => {
        const reqDate = new Date(req.updated_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return reqDate > weekAgo;
      }).length
    };

    allRequests.forEach(req => {
      stats.byStatus[req.status] = (stats.byStatus[req.status] || 0) + 1;
      stats.byMediaType[req.media_type] = (stats.byMediaType[req.media_type] || 0) + 1;
    });

    console.log('📈 Statistiques:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Récentes (7 jours): ${stats.recent}`);
    console.log(`   Par statut:`, stats.byStatus);
    console.log(`   Par type:`, stats.byMediaType);

    // 4. Recommandations
    console.log('\n4. Recommandations...');
    
    if (stats.total > 1000) {
      console.log('⚠️  Beaucoup de demandes - considérer la pagination');
    }
    
    if (stats.recent > 100) {
      console.log('⚠️  Beaucoup de demandes récentes - optimiser le cache');
    }

    console.log('✅ Approche recommandée: Récupérer toutes les demandes + cache côté client');
    console.log('✅ Durée de cache recommandée: 5 minutes');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Fonction pour nettoyer le cache (utile pour les tests)
function clearRequestCache() {
  console.log('🧹 Nettoyage du cache des demandes...');
  // Cette fonction serait appelée dans le code React
  console.log('✅ Cache nettoyé (simulation)');
}

if (require.main === module) {
  testRequestPerformance();
}

module.exports = { testRequestPerformance, clearRequestCache };
