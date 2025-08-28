import React from 'react';
import { FileX, RefreshCw, Download } from 'lucide-react';
import ErrorPage from './ErrorPage';
import { Button } from './button';

interface ModuleLoadErrorProps {
  moduleName?: string;
  error?: Error;
  onRetry?: () => void;
}

const ModuleLoadError: React.FC<ModuleLoadErrorProps> = ({
  moduleName = "module",
  error,
  onRetry
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const details = error && (
    <div className="space-y-3">
      <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <FileX className="h-4 w-4" />
          <span>Erreur de chargement : {moduleName}</span>
        </div>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            Détails techniques
          </summary>
          <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50">
            <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
              {error.message}
            </pre>
          </div>
        </details>
      )}
    </div>
  );

  return (
    <ErrorPage
      title="Erreur de chargement"
      description={`Impossible de charger ${moduleName}. Cela peut être dû à un problème de réseau ou de cache.`}
      icon={FileX}
      iconColor="text-red-500"
      gradientColors={{
        from: "from-red-500/5",
        via: "via-orange-500/5",
        to: "to-yellow-500/5"
      }}
      badge={{
        text: "Erreur de module",
        variant: "destructive",
        icon: FileX
      }}
      details={details}
      actions={
        <div className="space-y-3">
          <Button 
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer le chargement
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              // Vider le cache et recharger
              if ('caches' in window) {
                caches.keys().then(names => {
                  names.forEach(name => {
                    caches.delete(name);
                  });
                });
              }
              window.location.reload();
            }}
            className="w-full border-border/50 hover:bg-muted/50"
          >
            <Download className="mr-2 h-4 w-4" />
            Vider le cache et recharger
          </Button>
        </div>
      }
    />
  );
};

export default ModuleLoadError;
