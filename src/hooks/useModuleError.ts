import { useState, useCallback } from 'react';

interface ModuleErrorState {
  hasError: boolean;
  error: Error | null;
  moduleName: string | null;
}

export const useModuleError = () => {
  const [errorState, setErrorState] = useState<ModuleErrorState>({
    hasError: false,
    error: null,
    moduleName: null
  });

  const handleModuleError = useCallback((error: Error, moduleName?: string) => {
    console.error(`Erreur de chargement du module ${moduleName || 'inconnu'}:`, error);
    
    setErrorState({
      hasError: true,
      error,
      moduleName: moduleName || null
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      moduleName: null
    });
  }, []);

  const retryModuleLoad = useCallback(() => {
    clearError();
    // Optionnel : vider le cache du navigateur
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    // Recharger la page
    window.location.reload();
  }, [clearError]);

  return {
    ...errorState,
    handleModuleError,
    clearError,
    retryModuleLoad
  };
};
