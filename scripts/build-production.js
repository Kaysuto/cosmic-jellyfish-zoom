import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

console.log('🚀 Démarrage du build de production optimisé...');

try {
  // Nettoyer le dossier dist
  if (fs.existsSync('dist')) {
    fs.removeSync('dist');
    console.log('✅ Dossier dist nettoyé');
  }

  // Build avec source maps activées
  console.log('📦 Build en cours...');
  execSync('npm run build', { stdio: 'inherit' });

  // Vérifier que les source maps sont générées
  const assetsDir = path.join('dist', 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const sourceMaps = files.filter(file => file.endsWith('.js.map'));
    
    if (sourceMaps.length > 0) {
      console.log(`✅ ${sourceMaps.length} source map(s) générée(s)`);
    } else {
      console.warn('⚠️ Aucune source map générée');
    }
  }

  // Créer un fichier .htaccess pour optimiser le cache
  const htaccessContent = `# Optimisations de performance
<IfModule mod_expires.c>
  ExpiresActive On
  
  # Cache des assets JavaScript et CSS
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript.map "access plus 1 year"
  
  # Cache des images
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/jpg "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/gif "access plus 1 month"
  ExpiresByType image/webp "access plus 1 month"
  
  # Cache des polices
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Compression Gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Headers de sécurité
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options nosniff
  Header always set X-Frame-Options DENY
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>`;

  fs.writeFileSync(path.join('dist', '.htaccess'), htaccessContent);
  console.log('✅ Fichier .htaccess créé avec les optimisations');

  console.log('🎉 Build de production terminé avec succès !');
  console.log('📁 Fichiers générés dans le dossier dist/');
  
} catch (error) {
  console.error('❌ Erreur lors du build:', error.message);
  process.exit(1);
}
