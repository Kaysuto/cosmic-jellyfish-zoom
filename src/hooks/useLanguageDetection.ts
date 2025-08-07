import { useEffect } from 'react';
import i18n from '@/lib/i18n';

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
      // 1. Priorité : la langue déjà choisie par l'utilisateur et stockée localement
      const savedLanguage = localStorage.getItem('i18nextLng');
      if (savedLanguage && ['fr', 'en'].includes(savedLanguage)) {
        if (i18n.language !== savedLanguage) {
          i18n.changeLanguage(savedLanguage);
        }
        return;
      }
      
      // 2. Deuxième priorité : la langue par défaut définie dans les paramètres admin
      if (defaultLanguage && i18n.language !== defaultLanguage) {
        i18n.changeLanguage(defaultLanguage);
        return;
      }

      // 3. Fallback : détection par IP/navigateur si aucune des options ci-dessus n'est définie
      if (!i18n.language) {
        const countryCode = await getCountryFromIP();
        const language = countryCode ? (countryToLanguage[countryCode] || defaultLanguage) : defaultLanguage;
        i18n.changeLanguage(language);
      }
    };
    
    detectLanguage();
  }, [defaultLanguage]);
};