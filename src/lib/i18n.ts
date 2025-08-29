import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Chargement dynamique des traductions depuis les fichiers JSON
const loadTranslations = async () => {
  try {
    const [frCommon, enCommon, frAuth, enAuth, frCatalog, enCatalog, frRequests, enRequests, frAdmin, enAdmin, frNotifications, enNotifications, frStatus, enStatus, frLegal, enLegal, frCommunity, enCommunity, frProfile, enProfile, frSchedule, enSchedule, frServices, enServices] = await Promise.all([
      import('../locales/fr/common.json'),
      import('../locales/en/common.json'),
      import('../locales/fr/auth.json'),
      import('../locales/en/auth.json'),
      import('../locales/fr/catalog.json'),
      import('../locales/en/catalog.json'),
      import('../locales/fr/requests.json'),
      import('../locales/en/requests.json'),
      import('../locales/fr/admin.json'),
      import('../locales/en/admin.json'),
      import('../locales/fr/notifications.json'),
      import('../locales/en/notifications.json'),
      import('../locales/fr/status.json'),
      import('../locales/en/status.json'),
      import('../locales/fr/legal.json'),
      import('../locales/en/legal.json'),
      import('../locales/fr/community.json'),
      import('../locales/en/community.json'),
      import('../locales/fr/profile.json'),
      import('../locales/en/profile.json'),
      import('../locales/fr/schedule.json'),
      import('../locales/en/schedule.json'),
      import('../locales/fr/services.json'),
      import('../locales/en/services.json')
    ]);

    // Fusionner toutes les traductions par langue
    const frTranslations = {
      ...frCommon.default,
      ...frAuth.default,
      ...frCatalog.default,
      ...frRequests.default,
      ...frAdmin.default,
      ...frNotifications.default,
      ...frStatus.default,
      ...frLegal.default,
      ...frCommunity.default,
      ...frProfile.default,
      ...frSchedule.default,
      ...frServices.default
    };

    const enTranslations = {
      ...enCommon.default,
      ...enAuth.default,
      ...enCatalog.default,
      ...enRequests.default,
      ...enAdmin.default,
      ...enNotifications.default,
      ...enStatus.default,
      ...enLegal.default,
      ...enCommunity.default,
      ...enProfile.default,
      ...enSchedule.default,
      ...enServices.default
    };

    return {
      fr: { translation: frTranslations },
      en: { translation: enTranslations }
    };
  } catch (error) {
    console.error('Erreur lors du chargement des traductions:', error);
    // Fallback avec des traductions minimales
    return {
      fr: { translation: { error: 'Erreur de chargement des traductions' } },
      en: { translation: { error: 'Translation loading error' } }
    };
  }
};

// Initialisation d'i18n avec chargement asynchrone
const initializeI18n = async () => {
  const resources = await loadTranslations();

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'fr',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage', 'cookie'],
      },
      react: {
        useSuspense: false,
      },
    });
};

// Initialiser immédiatement et exporter la promesse
const i18nInitPromise = initializeI18n();

// Fonction utilitaire pour attendre l'initialisation
export const waitForI18n = () => {
  return i18nInitPromise;
};

export default i18n;