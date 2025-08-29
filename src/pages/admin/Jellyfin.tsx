import { motion, Variants } from 'framer-motion';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { 
  Server, 
  Download, 
  Settings, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Clock,
  Sparkles
} from 'lucide-react';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { showError, showSuccess } from '@/utils/toast';
import JellyfinSettings from '@/components/admin/JellyfinSettings';
import JellyfinUserManager from '@/components/admin/jellyfin/JellyfinUserManager';
import JellyfinImportExport from '@/components/admin/jellyfin/JellyfinImportExport';
import JellyfinStats from '@/components/admin/jellyfin/JellyfinStats';
import { supabase } from '@/integrations/supabase/client';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const slideInFromTop: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const JellyfinPage = () => {
  const { t } = useSafeTranslation();
  const { 
    serverInfo, 
    error, 
    connectionStatus, 
    syncLibrary 
  } = useJellyfin();
  
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [storedStats, setStoredStats] = useState<any>(null);

  // Récupérer l'état persistant depuis Supabase
  useEffect(() => {
    const fetchStoredStats = async () => {
      try {
        const [{ data: statsState }, { data: libsState }] = await Promise.all([
          supabase.from('jellyfin_statistics_state').select('*').eq('id', 1).single(),
          supabase.from('jellyfin_libraries_state').select('*')
        ]);

        if (statsState) {
          const assembled = {
            server_info: statsState.server_info,
            library_info: statsState.library_info,
            categorized_stats: statsState.categorized_stats,
            user_count: statsState.user_count,
            libraries: libsState || [],
          };
          setStoredStats(assembled);
          setLastSyncTime(statsState.last_sync || statsState.updated_at || statsState.created_at || null);
        }
      } catch (error) {
        console.log('Aucune statistique stockée trouvée');
      }
    };

    fetchStoredStats();
  }, []);

  const handleSyncLibrary = async () => {
    if (connectionStatus !== 'connected') {
      showError(t('jellyfin_not_connected'));
      return;
    }

    setSyncing(true);
    try {
      await syncLibrary();

      // Recharger l'état persistant après synchronisation
      const [{ data: statsState }, { data: libsState }] = await Promise.all([
        supabase.from('jellyfin_statistics_state').select('*').eq('id', 1).single(),
        supabase.from('jellyfin_libraries_state').select('*')
      ]);

      if (statsState) {
        const assembled = {
          server_info: statsState.server_info,
          library_info: statsState.library_info,
          categorized_stats: statsState.categorized_stats,
          user_count: statsState.user_count,
          libraries: libsState || [],
        };
        setStoredStats(assembled);
        setLastSyncTime(statsState.last_sync || statsState.updated_at || new Date().toISOString());
      }

      showSuccess(t('sync_success'));
    } catch (error: any) {
      showError(t('sync_error') + ': ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return t('connected');
      case 'disconnected':
        return t('disconnected');
      case 'loading':
        return t('connecting');
      default:
        return t('unknown');
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'disconnected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'loading':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const formatLastSync = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <motion.div
        className="container mx-auto px-4 py-8 space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-sm border-red-500/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-red-500">{t('jellyfin_connection_error')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{t('jellyfin_error_check_settings')}</p>
              <p className="text-sm text-red-400 font-mono bg-red-500/10 p-3 rounded-lg">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <JellyfinSettings />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8 space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* En-tête avec statut de connexion */}
      <motion.div variants={slideInFromTop}>
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <Server className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {serverInfo?.ServerName || t('jellyfin_server')}
                  </CardTitle>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-muted-foreground">
                      {t('version')} {serverInfo?.Version}
                    </p>
                    {lastSyncTime && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{t('last_sync')}: {formatLastSync(lastSyncTime)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className={`${getConnectionStatusColor()} flex items-center space-x-2 px-4 py-2`}>
                  {getConnectionStatusIcon()}
                  <span className="font-medium">{getConnectionStatusText()}</span>
                </Badge>
                <Button
                  onClick={handleSyncLibrary}
                  disabled={syncing || connectionStatus !== 'connected'}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  {syncing ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {syncing ? t('sync_in_progress') : t('sync_now')}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Cartes de statistiques rapides supprimées pour éviter les doublons avec le tableau de bord */}

      {/* Onglets principaux */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              <span>{t('overview')}</span>
            </TabsTrigger>
            <TabsTrigger value="import-export" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Download className="h-4 w-4" />
              <span>{t('import_export')}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Settings className="h-4 w-4" />
              <span>{t('settings')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <JellyfinStats storedStats={storedStats} />
          </TabsContent>

          <TabsContent value="import-export" className="space-y-6">
            <JellyfinImportExport />
            <JellyfinUserManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <JellyfinSettings />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default JellyfinPage;