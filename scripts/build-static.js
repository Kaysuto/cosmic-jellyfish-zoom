import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildStatic() {
  const sourceDir = 'dist';
  const targetDir = 'dist-static';
  
  try {
    // Nettoyer le dossier de destination
    await fs.remove(targetDir);
    await fs.ensureDir(targetDir);
    
    // Copier tous les fichiers du build
    await fs.copy(sourceDir, targetDir);
    
    // Lire le fichier index.html original
    const indexPath = path.join(targetDir, 'index.html');
    let indexContent = await fs.readFile(indexPath, 'utf-8');
    
    // Ajouter du code de debug et de gestion d'erreurs
    const debugAndFallbackScript = `
    <script>
      // Debug et gestion d'erreurs pour Plesk
      console.log('🚀 Application en cours de chargement...');
      
      // Fallbacks pour les variables d'environnement
      window.ENV = window.ENV || {};
      
      // Variables par défaut pour éviter les erreurs
      if (!window.ENV.SUPABASE_URL) {
        console.warn('⚠️ VITE_SUPABASE_URL non définie, utilisation d\'une URL par défaut');
        window.ENV.SUPABASE_URL = 'https://placeholder.supabase.co';
      }
      
      if (!window.ENV.SUPABASE_ANON_KEY) {
        console.warn('⚠️ VITE_SUPABASE_ANON_KEY non définie, utilisation d\'une clé par défaut');
        window.ENV.SUPABASE_ANON_KEY = 'placeholder-key';
      }
      
      if (!window.ENV.JELLYFIN_URL) {
        console.warn('⚠️ VITE_JELLYFIN_URL non définie');
        window.ENV.JELLYFIN_URL = '';
      }
      
      if (!window.ENV.JELLYFIN_API_KEY) {
        console.warn('⚠️ VITE_JELLYFIN_API_KEY non définie');
        window.ENV.JELLYFIN_API_KEY = '';
      }
      
      // Gestion d'erreurs globale
      window.addEventListener('error', function(e) {
        console.error('❌ Erreur JavaScript:', e.error);
        
        // Afficher une page d'erreur simple
        if (document.getElementById('root')) {
          document.getElementById('root').innerHTML = \`
            <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto;">
              <h1 style="color: #dc2626;">Erreur de chargement</h1>
              <p>L'application n'a pas pu se charger correctement.</p>
              <details style="margin-top: 20px;">
                <summary>Détails techniques</summary>
                <p><strong>Erreur:</strong> \${e.error.message}</p>
                <p><strong>Fichier:</strong> \${e.filename}</p>
                <p><strong>Ligne:</strong> \${e.lineno}</p>
              </details>
              <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Recharger la page
              </button>
            </div>
          \`;
        }
      });
      
      // Vérifier que React se charge
      window.addEventListener('load', function() {
        console.log('✅ Page chargée');
        setTimeout(function() {
          if (!document.getElementById('root').children.length) {
            console.error('❌ React n\'a pas rendu le contenu');
            document.getElementById('root').innerHTML = \`
              <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; text-align: center;">
                <h1 style="color: #2563eb;">Statut des Services Jelly</h1>
                <p>L'application est en cours de chargement...</p>
                <div style="margin: 20px 0;">
                  <div style="width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
                <p style="color: #6b7280; font-size: 14px;">Si cette page reste affichée, il y a un problème avec le chargement de l'application.</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  Recharger
                </button>
              </div>
              <style>
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            \`;
          }
        }, 3000);
      });
      
      // Fallback si les modules ne se chargent pas
      setTimeout(function() {
        if (!window.React) {
          console.error('❌ React non chargé');
          document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red; font-family: Arial, sans-serif;"><h1>Erreur de chargement</h1><p>React n\'a pas pu être chargé. Vérifiez la console pour plus de détails.</p></div>';
        }
      }, 5000);
      
      console.log('✅ Debug et fallbacks configurés');
    </script>`;
    
    // Insérer le script avant la fermeture de </head>
    indexContent = indexContent.replace('</head>', debugAndFallbackScript + '\n  </head>');
    
    // Écrire le fichier modifié
    await fs.writeFile(indexPath, indexContent);
    
    // Créer un fichier .htaccess simplifié et compatible
    const htaccessContent = `# Configuration pour SPA React Router
RewriteEngine On

# Rediriger toutes les requêtes vers index.html sauf pour les fichiers existants
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# Cache pour les assets statiques (version simplifiée)
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Compression gzip (version simplifiée)
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>

# Variables d'environnement (optionnel - décommentez et configurez si nécessaire)
# SetEnv VITE_SUPABASE_URL "votre_url_supabase"
# SetEnv VITE_SUPABASE_ANON_KEY "votre_clé_supabase"
# SetEnv VITE_JELLYFIN_URL "votre_url_jellyfin"
# SetEnv VITE_JELLYFIN_API_KEY "votre_clé_jellyfin"`;
    
    await fs.writeFile(path.join(targetDir, '.htaccess'), htaccessContent);
    
    // Créer un fichier README pour le déploiement
    const readmeContent = `# Version Statique pour Plesk

Cette version contient tous les fichiers nécessaires pour déployer l'application sur Plesk.

## Instructions de déploiement :

1. Uploadez tous les fichiers de ce dossier dans le répertoire public_html de votre domaine
2. Assurez-vous que le fichier .htaccess est bien présent
3. Configurez votre domaine pour pointer vers ce répertoire

## Fonctionnalités incluses :

- ✅ **Debug intégré** : Messages console pour identifier les problèmes
- ✅ **Fallbacks automatiques** : Variables d'environnement par défaut
- ✅ **Gestion d'erreurs** : Pages d'erreur visibles en cas de problème
- ✅ **Configuration SPA** : React Router configuré avec .htaccess
- ✅ **Cache optimisé** : Headers de cache pour performance
- ✅ **Compression gzip** : Réduction de la taille des fichiers

## En cas de problème :

### Page blanche :
- Ouvrez la console du navigateur (F12)
- Vérifiez les messages de debug
- L'application affichera des messages d'erreur visibles

### Erreur 500 :
- Vérifiez que mod_rewrite est activé
- Supprimez temporairement le fichier .htaccess pour tester
- Contactez votre hébergeur si nécessaire

### Variables d'environnement :
- Décommentez les lignes dans .htaccess
- Configurez vos vraies URLs et clés
- Ou laissez les valeurs par défaut pour les tests

## Structure des fichiers :
- index.html : Page principale avec debug et fallbacks
- assets/ : Tous les fichiers JavaScript et CSS optimisés
- locales/ : Fichiers de traduction
- favicon.ico, logo.png : Assets statiques
- robots.txt : Configuration SEO
- .htaccess : Configuration Apache pour SPA

## Support :
En cas de problème, vérifiez que :
- mod_rewrite est activé sur votre serveur
- Les permissions des fichiers sont correctes (644 pour les fichiers, 755 pour les dossiers)
- Le domaine pointe vers le bon répertoire`;
    
    await fs.writeFile(path.join(targetDir, 'README-DEPLOYMENT.md'), readmeContent);
    
    console.log('✅ Version statique créée avec succès dans le dossier dist-static/');
    console.log('📁 Contenu du dossier :');
    
    const files = await fs.readdir(targetDir);
    for (const file of files) {
      const stats = await fs.stat(path.join(targetDir, file));
      if (stats.isDirectory()) {
        const subFiles = await fs.readdir(path.join(targetDir, file));
        console.log(`  📂 ${file}/ (${subFiles.length} fichiers)`);
      } else {
        console.log(`  📄 ${file}`);
      }
    }
    
    console.log('\n🚀 Prêt pour le déploiement sur Plesk !');
    console.log('📋 Consultez README-DEPLOYMENT.md pour les instructions détaillées.');
    console.log('💡 Cette version inclut debug, fallbacks et gestion d\'erreurs.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la version statique:', error);
    process.exit(1);
  }
}

buildStatic();
