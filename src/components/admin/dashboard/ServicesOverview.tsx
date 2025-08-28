import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useServices } from '@/hooks/useServices';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ServicesOverview = () => {
  const { t } = useTranslation();
  const { services, loading } = useServices();
  const navigate = useNavigate();

  const statusConfig = {
    operational: { 
      color: 'bg-green-500', 
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      icon: CheckCircle,
      label: 'Opérationnel'
    },
    degraded: { 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      icon: AlertTriangle,
      label: 'Dégradé'
    },
    downtime: { 
      color: 'bg-red-500', 
      textColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      icon: AlertTriangle,
      label: 'Indisponible'
    },
    maintenance: { 
      color: 'bg-blue-500', 
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      icon: Clock,
      label: 'Maintenance'
    },
  };

  const operationalServices = services.filter(s => s.status === 'operational').length;
  const totalServices = services.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t('services_overview_title')}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                {t('services_overview_subtitle')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                {operationalServices}/{totalServices} {t('services_operational')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <Skeleton className="h-12 w-full rounded-lg" />
                </motion.div>
              ))}
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {services.map((service, index) => {
                  const config = statusConfig[service.status];
                  const Icon = config.icon;
                  
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -10, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.25, 
                        delay: index * 0.05,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      whileHover={{ 
                        x: 2, 
                        scale: 1.01,
                        transition: { duration: 0.15, ease: "easeOut" }
                      }}
                      onClick={() => navigate('/admin/services')}
                      className={cn(
                        "group relative p-4 rounded-xl border transition-all duration-150 cursor-pointer",
                        config.bgColor,
                        config.borderColor,
                        "hover:shadow-md hover:shadow-current/10"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-xl" />
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={cn("h-3 w-3 rounded-full", config.color)} />
                            <div className="absolute inset-0 h-3 w-3 rounded-full bg-current animate-ping opacity-20" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", config.textColor)} />
                            <span className="font-medium text-foreground">
                              {t(service.name.toLowerCase().replace(/ /g, '_'))}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "border-current/30",
                              config.textColor,
                              config.bgColor
                            )}
                          >
                            {config.label}
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="pt-4 border-t border-border/50"
          >
            <Button asChild variant="ghost" className="w-full group hover:bg-primary/10">
              <Link to="/admin/services" className="flex items-center justify-center gap-2">
                <Activity className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                Gérer tous les services
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServicesOverview;