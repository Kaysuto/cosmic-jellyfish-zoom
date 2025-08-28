import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

console.log('🖼️ Optimisation des images...');

try {
  // Vérifier si sharp est installé
  try {
    require('sharp');
  } catch (error) {
    console.log('📦 Installation de sharp pour l\'optimisation d\'images...');
    execSync('npm install sharp', { stdio: 'inherit' });
  }

  const sharp = require('sharp');
  
  // Dossiers à traiter
  const imageDirs = [
    'public',
    'src/assets',
    'dist/assets'
  ];

  let optimizedCount = 0;
  let totalSavings = 0;

  for (const dir of imageDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      if (file.isFile() && /\.(png|jpg|jpeg)$/i.test(file.name)) {
        const filePath = path.join(dir, file.name);
        const stats = fs.statSync(filePath);
        const originalSize = stats.size;

        try {
          // Créer des versions optimisées
          const image = sharp(filePath);
          const metadata = await image.metadata();

          // Version WebP
          const webpPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
          await image
            .webp({ quality: 80, effort: 6 })
            .toFile(webpPath);

          // Version AVIF si supporté
          try {
            const avifPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.avif');
            await sharp(filePath)
              .avif({ quality: 70, effort: 6 })
              .toFile(avifPath);
          } catch (avifError) {
            console.log(`⚠️ AVIF non supporté pour ${file.name}`);
          }

          // Version responsive pour les grandes images
          if (metadata.width > 800) {
            const responsiveDir = path.join(dir, 'responsive');
            if (!fs.existsSync(responsiveDir)) {
              fs.mkdirSync(responsiveDir, { recursive: true });
            }

            const sizes = [400, 800, 1200];
            for (const size of sizes) {
              if (metadata.width >= size) {
                const responsivePath = path.join(responsiveDir, `${path.parse(file.name).name}-${size}w.webp`);
                await sharp(filePath)
                  .resize(size)
                  .webp({ quality: 80 })
                  .toFile(responsivePath);
              }
            }
          }

          const webpStats = fs.statSync(webpPath);
          const savings = originalSize - webpStats.size;
          totalSavings += savings;
          optimizedCount++;

          console.log(`✅ ${file.name} optimisé (${(savings / 1024).toFixed(1)} KB économisés)`);

        } catch (error) {
          console.warn(`⚠️ Erreur lors de l'optimisation de ${file.name}:`, error.message);
        }
      }
    }
  }

  console.log(`\n📊 Résumé de l'optimisation:`);
  console.log(`   - Images optimisées: ${optimizedCount}`);
  console.log(`   - Économies totales: ${(totalSavings / 1024).toFixed(1)} KB`);
  console.log(`   - Formats générés: WebP, AVIF, responsive`);

  // Créer un fichier de configuration pour les images optimisées
  const imageConfig = {
    formats: ['webp', 'avif'],
    responsive: true,
    quality: {
      webp: 80,
      avif: 70
    },
    sizes: [400, 800, 1200]
  };

  fs.writeFileSync('image-optimization-config.json', JSON.stringify(imageConfig, null, 2));
  console.log('✅ Configuration d\'optimisation sauvegardée');

} catch (error) {
  console.error('❌ Erreur lors de l\'optimisation des images:', error.message);
  process.exit(1);
}
