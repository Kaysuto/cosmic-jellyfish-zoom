import { useEffect, useState } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { waitForI18n } from '@/lib/i18n';

export const useSafeTranslation = () => {
  const [isReady, setIsReady] = useState(false);
  const translation = useI18nTranslation();

  useEffect(() => {
    const initTranslation = async () => {
      try {
        await waitForI18n();
        setIsReady(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation i18n:', error);
        // Fallback: on considère quand même que c'est prêt pour éviter les blocages
        setIsReady(true);
      }
    };

    initTranslation();
  }, []);

  return {
    ...translation,
    isReady,
    t: isReady ? translation.t : ((key: string, options?: any) => key)
  };
};
