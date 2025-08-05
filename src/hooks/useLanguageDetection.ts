import { useEffect } from 'react';
import i18n from '@/lib/i18n';

// Fonction pour obtenir le code pays à partir de l'IP
const getCountryFromIP = async (): Promise<string | null> => {
  try {
    // Utilisation d'un service gratuit pour obtenir le pays à partir de l'IP
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.error('Erreur lors de la détection du pays:', error);
    return null;
  }
};

// Mapping des codes pays vers les langues
const countryToLanguage: Record<string, string> = {
  'FR': 'fr',
  'BE': 'fr',
  'CH': 'fr',
  'CA': 'fr',
  'GB': 'en',
  'US': 'en',
  'AU': 'en',
  'NZ': 'en',
  'IE': 'en',
  'ZA': 'en',
  'CA': 'en', // Note: Le Canada a aussi le français, mais on met l'anglais par défaut
};

export const useLanguageDetection = () => {
  useEffect(() => {
    const detectLanguage = async () => {
      // Vérifier si une langue est déjà définie
      const savedLanguage = localStorage.getItem('i18nextLng');
      if (savedLanguage) {
        return;
      }
      
      // Obtenir le code pays à partir de l'IP
      const countryCode = await getCountryFromIP();
      
      if (countryCode) {
        const language = countryToLanguage[countryCode] || 'fr'; // Français par défaut
        i18n.changeLanguage(language);
      } else {
        // Si la détection échoue, utiliser le français par défaut
        i18n.changeLanguage('fr');
      }
    };
    
    detectLanguage();
  }, []);
};