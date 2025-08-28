import { useEffect, useState } from 'react';
import { waitForI18n } from '@/lib/i18n';

interface I18nLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const I18nLoader = ({ children, fallback }: I18nLoaderProps) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initI18n = async () => {
      try {
        await waitForI18n();
        setIsReady(true);
      } catch (err) {
        console.error('Erreur lors de l\'initialisation i18n:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        // On considère quand même que c'est prêt pour éviter les blocages
        setIsReady(true);
      }
    };

    initI18n();
  }, []);

  if (!isReady) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.warn('i18n initialisé avec erreur:', error);
  }

  return <>{children}</>;
};
