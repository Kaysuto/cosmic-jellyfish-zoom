import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface ErrorPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  gradientColors?: {
    from: string;
    via?: string;
    to: string;
  };
  actions?: React.ReactNode;
  details?: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    icon?: LucideIcon;
  };
  showBackButton?: boolean;
  showHomeButton?: boolean;
  onBack?: () => void;
  onHome?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = "text-red-500",
  gradientColors = {
    from: "from-red-500/5",
    via: "via-orange-500/5", 
    to: "to-yellow-500/5"
  },
  actions,
  details,
  badge,
  showBackButton = true,
  showHomeButton = true,
  onBack,
  onHome
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden border-0 shadow-xl bg-background/80 backdrop-blur-sm">
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors.from} ${gradientColors.via || ''} ${gradientColors.to}`} />
          
          <CardHeader className="relative text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-${iconColor.replace('text-', '')}/10 to-${iconColor.replace('text-', '')}/20 border border-${iconColor.replace('text-', '')}/20`}
            >
              <Icon className={`h-12 w-12 ${iconColor} mx-auto`} />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {title}
            </CardTitle>
            
            <CardDescription className="text-base text-muted-foreground">
              {description}
            </CardDescription>

            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mt-2"
              >
                <Badge variant={badge.variant || "outline"} className="border-border/50">
                  {badge.icon && <badge.icon className="mr-1 h-3 w-3" />}
                  {badge.text}
                </Badge>
              </motion.div>
            )}
          </CardHeader>

          <CardContent className="relative space-y-6">
            {/* Custom actions */}
            {actions}

            {/* Default actions */}
            {(!actions && (showBackButton || showHomeButton)) && (
              <div className="flex flex-col sm:flex-row gap-3">
                {showHomeButton && (
                  <Button 
                    onClick={handleHome}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Retour à l'accueil
                  </Button>
                )}
                
                {showBackButton && (
                  <Button 
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 border-border/50 hover:bg-muted/50"
                  >
                    Retour
                  </Button>
                )}
              </div>
            )}

            {/* Details section */}
            {details && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                {details}
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
};

export default ErrorPage;
