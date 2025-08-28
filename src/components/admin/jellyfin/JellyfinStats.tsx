import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { 
  Film, 
  Tv, 
  Play, 
  Zap, 
  RefreshCw, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Server,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJellyfin } from '@/hooks/useJellyfin';

const JellyfinStats = () => {
  const { t } = useTranslation();
  const { 
    stats, 
    serverInfo, 
    connectionStatus, 
    lastSync, 
    isSyncing, 
    loading, 
    syncWithJellyfin 
  } = useJellyfin();

  const mediaCategories = [
    { key: 'animations', label: t('animations'), icon: Play, variant: 'success' as const },
    { key: 'anime', label: t('anime'), icon: Zap, variant: 'info' as const },
    { key: 'series', label: t('series'), icon: Tv, variant: 'warning' as const },
    { key: 'films', label: t('films'), icon: Film, variant: 'danger' as const },
  ];

  const totalMedia = stats ? Object.values(stats).reduce((sum, count) => sum + count, 0) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-xl" />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header avec statut et bouton sync */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={cn(
              "border-current/30",
              connectionStatus === 'connected' 
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                : connectionStatus === 'disconnected'
                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
            )}
          >
            {connectionStatus === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
            {connectionStatus === 'disconnected' && <AlertCircle className="h-3 w-3 mr-1" />}
            {connectionStatus === 'loading' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            {t(connectionStatus)}
          </Badge>
          <Button 
            onClick={syncWithJellyfin} 
            disabled={isSyncing || connectionStatus !== 'connected'}
            variant="outline" 
            size="sm"
            className="group hover:bg-primary/10"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
            )}
            <span className="ml-2">{isSyncing ? t('sync_in_progress') : t('sync_now')}</span>
          </Button>
        </div>
        {lastSync && (
          <p className="text-sm text-muted-foreground">
            {t('last_sync')}: {new Date(lastSync).toLocaleString()}
          </p>
        )}
      </motion.div>

      {/* Informations serveur */}
      {serverInfo && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Server className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('server_name')}</p>
                  <p className="font-semibold">{serverInfo.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('server_version')}</p>
                  <p className="font-semibold">{serverInfo.version}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Statistiques totales */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <CardContent className="relative p-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {totalMedia.toLocaleString()}
              </h3>
              <p className="text-lg text-muted-foreground mt-2">{t('total_media')}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grille des catégories de médias */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mediaCategories.map((category) => {
          const Icon = category.icon;
          const count = stats?.[category.key as keyof typeof stats] || 0;
          
          const variantStyles = {
            success: {
              card: "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20",
              icon: "text-green-500",
              value: "text-green-600 dark:text-green-400",
              title: "text-green-700/70 dark:text-green-300/70"
            },
            info: {
              card: "bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20",
              icon: "text-blue-500",
              value: "text-blue-600 dark:text-blue-400",
              title: "text-blue-700/70 dark:text-blue-300/70"
            },
            warning: {
              card: "bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/20",
              icon: "text-yellow-500",
              value: "text-yellow-600 dark:text-yellow-400",
              title: "text-yellow-700/70 dark:text-yellow-300/70"
            },
            danger: {
              card: "bg-gradient-to-br from-red-500/10 to-pink-500/5 border-red-500/20",
              icon: "text-red-500",
              value: "text-red-600 dark:text-red-400",
              title: "text-red-700/70 dark:text-red-300/70"
            }
          };

          const styles = variantStyles[category.variant];
          
          return (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.25, 
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: Math.random() * 0.1
              }}
              whileHover={{ 
                y: -2, 
                scale: 1.01,
                transition: { duration: 0.15, ease: "easeOut" }
              }}
            >
              <Card className={cn(
                "relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-150",
                styles.card
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-150" />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className={cn("text-sm font-medium transition-colors", styles.title)}>
                    {category.label}
                  </CardTitle>
                  <motion.div
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="relative"
                  >
                    <Icon className={cn("h-5 w-5 transition-all duration-150", styles.icon)} />
                    <div className="absolute inset-0 bg-current rounded-full blur-sm opacity-20" />
                  </motion.div>
                </CardHeader>
                
                <CardContent className="space-y-2">
                  <motion.div 
                    className={cn("text-2xl font-bold tracking-tight", styles.value)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    {count.toLocaleString()}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default JellyfinStats;
