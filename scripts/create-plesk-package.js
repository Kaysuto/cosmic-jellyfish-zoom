import fs from 'fs-extra';
import archiver from 'archiver';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createPleskPackage() {
  const sourceDir = 'dist-static';
  const outputFile = 'plesk-package.zip';
  
  try {
    // Vérifier que le dossier source existe
    if (!await fs.pathExists(sourceDir)) {
      console.error('❌ Le dossier dist-static/ n\'existe pas. Exécutez d\'abord npm run build:plesk');
      process.exit(1);
    }
    
    // Créer le fichier ZIP
    const output = fs.createWriteStream(outputFile);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression maximale
    });
    
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`✅ Package Plesk créé : ${outputFile} (${sizeInMB} MB)`);
      console.log('📦 Prêt pour upload sur Plesk !');
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    
    // Ajouter tous les fichiers du dossier dist-static
    archive.directory(sourceDir, false);
    
    await archive.finalize();
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du package Plesk:', error);
    process.exit(1);
  }
}

createPleskPackage();
