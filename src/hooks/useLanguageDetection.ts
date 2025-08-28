import { useEffect } from 'react';
import i18n from '@/lib/i18n';
import { waitForI18n } from '@/lib/i18n';

const getCountryFromIP = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.error('Erreur lors de la détection du pays:', error);
    return null;
  }
};

const countryToLanguage: Record<string, string> = {
  'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'CA': 'fr',
  'GB': 'en', 'US': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en', 'ZA': 'en'
};

export const useLanguageDetection = (defaultLanguage: 'fr' | 'en') => {
  useEffect(() => {
    const detectLanguage = async () => {
      // Attendre que i18n soit initialisé
      try {
        await waitForI18n();
      } catch (error) {
        console.error('Erreur lors de l\'attente d\'i18n:', error);
        return;
      }

      // 1. Priorité : la langue déjà choisie par l'utilisateur et stockée localement
      const savedLanguage = localStorage.getItem('i18nextLng');
      if (savedLanguage && ['fr', 'en'].includes(savedLanguage)) {
        if (i18n.language !== savedLanguage) {
          try {
            await i18n.changeLanguage(savedLanguage);
          } catch (error) {
            console.error('Erreur lors du changement de langue:', error);
          }
        }
        return;
      }
      
      // 2. Deuxième priorité : la langue par défaut définie dans les paramètres admin
      if (defaultLanguage && i18n.language !== defaultLanguage) {
        try {
          await i18n.changeLanguage(defaultLanguage);
        } catch (error) {
          console.error('Erreur lors du changement de langue:', error);
        }
        return;
      }

      // 3. Fallback : détection par IP/navigateur si aucune des options ci-dessus n'est définie
      if (!i18n.language) {
        const countryCode = await getCountryFromIP();
        const language = countryCode ? (countryToLanguage[countryCode] || defaultLanguage) : defaultLanguage;
        try {
          await i18n.changeLanguage(language);
        } catch (error) {
          console.error('Erreur lors du changement de langue:', error);
        }
      }
    };
    
    detectLanguage();
  }, [defaultLanguage]);
};