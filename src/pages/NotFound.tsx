import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useSafeTranslation } from "@/hooks/useSafeTranslation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft, Search } from "lucide-react";
import { FooterContent } from "@/components/layout/FooterContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const NotFound = () => {
  const location = useLocation();
  const { t } = useSafeTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Contenu principal */}
      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          <Card className="relative overflow-hidden border-0 shadow-xl bg-background/80 backdrop-blur-sm">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
            
            <CardHeader className="relative text-center pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
              >
                <AlertTriangle className="h-12 w-12 text-blue-500 mx-auto" />
              </motion.div>
              
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                404
              </CardTitle>
              
              <CardDescription className="text-xl text-foreground font-semibold">
                {t('page_not_found')}
              </CardDescription>
              
              <p className="text-muted-foreground mt-2">
                {t('page_not_found_desc')}
              </p>
            </CardHeader>

            <CardContent className="relative space-y-6">
              {/* URL info */}
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Search className="h-4 w-4" />
                  <span>Page recherchée :</span>
                </div>
                <code className="block mt-1 text-xs font-mono text-foreground break-all">
                  {location.pathname}
                </code>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  asChild
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Retour à l'accueil
                  </Link>
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

              {/* Quick links */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Pages populaires :
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/catalog" className="text-xs">
                      Catalogue
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/status" className="text-xs">
                      Statut
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/about" className="text-xs">
                      À propos
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Help section */}
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  Si vous pensez qu'il s'agit d'une erreur, contactez notre équipe de support.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Pied de page */}
      <footer className="w-full">
        <FooterContent />
      </footer>
    </div>
  );
};

export default NotFound;