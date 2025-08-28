import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

interface UseTurnstileReturn {
  isVerifying: boolean;
  verifyToken: (token: string) => Promise<boolean>;
  resetVerification: () => void;
}

export const useTurnstile = (): UseTurnstileReturn => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyToken = useCallback(async (token: string): Promise<boolean> => {
    if (!token) {
      showError('Token de vérification manquant');
      return false;
    }

    setIsVerifying(true);
    
    try {
      // Appeler une fonction Supabase Edge Function pour vérifier le token
      const { data, error } = await supabase.functions.invoke('verify-turnstile', {
        body: { token }
      });

      if (error) {
        console.error('Erreur de vérification Turnstile:', error);
        showError('Échec de la vérification du captcha');
        return false;
      }

      if (data?.success) {
        return true;
      } else {
        showError('Vérification du captcha échouée');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification Turnstile:', error);
      showError('Erreur lors de la vérification du captcha');
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const resetVerification = useCallback(() => {
    setIsVerifying(false);
  }, []);

  return {
    isVerifying,
    verifyToken,
    resetVerification,
  };
};
