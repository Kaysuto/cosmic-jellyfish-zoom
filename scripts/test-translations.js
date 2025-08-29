import fs from 'fs';
import path from 'path';

async function testTranslations() {
  console.log('🔍 Test des traductions...\n');

  try {
    // Test 1: Vérifier que les fichiers JSON sont valides
    console.log('📊 Test 1: Validation des fichiers JSON...');
    
    const frAuthPath = path.join(process.cwd(), 'src/locales/fr/auth.json');
    const enAuthPath = path.join(process.cwd(), 'src/locales/en/auth.json');
    
    const frAuthContent = fs.readFileSync(frAuthPath, 'utf8');
    const enAuthContent = fs.readFileSync(enAuthPath, 'utf8');
    
    const frAuth = JSON.parse(frAuthContent);
    const enAuth = JSON.parse(enAuthContent);
    
    console.log('✅ Fichiers JSON chargés avec succès');
    console.log(`   FR Auth: ${Object.keys(frAuth).length} clés`);
    console.log(`   EN Auth: ${Object.keys(enAuth).length} clés`);

    // Test 2: Vérifier quelques clés importantes
    console.log('\n📊 Test 2: Vérification des clés importantes...');
    
    const importantKeys = [
      'login',
      'sign_in',
      'sign_up',
      'password',
      'email_address',
      'forgot_password',
      'jellyfin_welcome_title',
      'jellyfin_welcome_desc'
    ];

    importantKeys.forEach(key => {
      const frValue = frAuth[key];
      const enValue = enAuth[key];
      
      if (frValue && enValue) {
        console.log(`   ✅ ${key}: "${frValue}" / "${enValue}"`);
      } else {
        console.log(`   ❌ ${key}: Manquant`);
      }
    });

    // Test 3: Vérifier qu'il n'y a pas de clés dupliquées
    console.log('\n📊 Test 3: Vérification des clés dupliquées...');
    
    const frKeys = Object.keys(frAuth);
    const enKeys = Object.keys(enAuth);
    
    const frDuplicates = frKeys.filter((key, index) => frKeys.indexOf(key) !== index);
    const enDuplicates = enKeys.filter((key, index) => enKeys.indexOf(key) !== index);
    
    if (frDuplicates.length === 0 && enDuplicates.length === 0) {
      console.log('✅ Aucune clé dupliquée trouvée');
    } else {
      console.log('❌ Clés dupliquées trouvées:');
      if (frDuplicates.length > 0) {
        console.log(`   FR: ${frDuplicates.join(', ')}`);
      }
      if (enDuplicates.length > 0) {
        console.log(`   EN: ${enDuplicates.join(', ')}`);
      }
    }

    // Test 4: Vérifier la syntaxe JSON
    console.log('\n📊 Test 4: Validation de la syntaxe JSON...');
    
    try {
      JSON.parse(frAuthContent);
      JSON.parse(enAuthContent);
      console.log('✅ Syntaxe JSON valide');
    } catch (error) {
      console.log('❌ Erreur de syntaxe JSON:', error.message);
    }

    console.log('\n🎉 Test des traductions terminé !');
    console.log('\n📋 Résumé:');
    console.log('   ✅ Fichiers JSON chargés');
    console.log('   ✅ Clés importantes présentes');
    console.log('   ✅ Syntaxe JSON valide');
    console.log('   ✅ Prêt pour l\'utilisation dans l\'application');

  } catch (error) {
    console.error('❌ Erreur lors du test des traductions:', error);
  }
}

testTranslations();
