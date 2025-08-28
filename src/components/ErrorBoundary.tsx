import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Filtrer les erreurs Cloudflare et autres erreurs non critiques
    if (error.message.includes('ERR_BLOCKED_BY_CLIENT') || 
        error.message.includes('cloudflare') ||
        (errorInfo.componentStack && errorInfo.componentStack.includes('cloudflare'))) {
      console.warn('Erreur Cloudflare ignorée:', error.message);
      return;
    }
    
    // Détecter les erreurs de chargement de modules dynamiques
    if (error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Loading chunk') ||
        error.message.includes('Loading CSS chunk')) {
      console.error('Erreur de chargement de module dynamique:', error, errorInfo);
      this.setState({ 
        hasError: true, 
        error: new Error(`Erreur de chargement de module: ${error.message}`)
      });
      return;
    }
    
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // En production, envoyer l'erreur à un service de monitoring si nécessaire
    if (process.env.NODE_ENV === 'production') {
      // Ici vous pourriez envoyer l'erreur à Sentry, LogRocket, etc.
      console.warn('Erreur en production - considérez l\'ajout d\'un service de monitoring');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="relative overflow-hidden border-0 shadow-xl bg-background/80 backdrop-blur-sm">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5" />
              
              <CardHeader className="relative text-center pb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20"
                >
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                </motion.div>
                
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Oups ! Une erreur est survenue
                </CardTitle>
                
                <CardDescription className="text-base text-muted-foreground">
                  L'application a rencontré un problème inattendu. Ne vous inquiétez pas, nous sommes là pour vous aider.
                </CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-6">
                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Rafraîchir la page
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="flex-1 border-border/50 hover:bg-muted/50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button 
                    variant="ghost"
                    onClick={() => window.location.href = '/'}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Retour à l'accueil
                  </Button>
                </div>

                {/* Error details in development */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-orange-500/30 text-orange-600">
                        <Bug className="mr-1 h-3 w-3" />
                        Mode développement
                      </Badge>
                    </div>
                    
                    <details className="group">
                      <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                        <span className="group-open:rotate-90 transition-transform">▶</span>
                        Détails de l'erreur
                      </summary>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50"
                      >
                        <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </motion.div>
                    </details>
                  </motion.div>
                )}

                {/* Help section */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground text-center">
                    Si le problème persiste, contactez notre équipe de support.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
