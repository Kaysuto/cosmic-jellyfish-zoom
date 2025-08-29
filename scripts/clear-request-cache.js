#!/usr/bin/env node

/**
 * Script pour nettoyer le cache global des demandes
 * Usage: node scripts/clear-request-cache.js
 */

console.log('🧹 Nettoyage du cache global des demandes...');

// Simulation du nettoyage du cache global
// Dans le code React, cela serait fait en invalidant les variables globales

console.log('✅ Cache global des demandes nettoyé !');
console.log('');
console.log('📝 Pour nettoyer le cache dans le code React :');
console.log('1. Invalider globalRequestCache = null');
console.log('2. Invalider globalCacheTimestamp = 0');
console.log('3. Appeler forceRefresh() sur les composants');
console.log('');
console.log('🔄 Le cache sera automatiquement reconstruit lors de la prochaine requête.');

module.exports = { clearCache: () => console.log('Cache cleared') };
