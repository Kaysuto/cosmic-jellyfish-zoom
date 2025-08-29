import { useState } from 'react';
import { useServices } from '@/hooks/useServices';
import { useIncidents } from '@/hooks/useIncidents';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import ServicesStatus from '@/components/status/ServicesStatus';
import IncidentHistory from '@/components/status/IncidentHistory';
import UptimeHistory from '@/components/status/UptimeHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, Activity, Clock, Server, TrendingUp } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';
import DiscordWidget from '@/components/widgets/DiscordWidget';
import { Badge } from '@/components/ui/badge';

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

const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const Status = () => {
  const { services, loading: servicesLoading } = useServices();
  const { loading: incidentsLoading, activeIncidents } = useIncidents();
  const { getSetting, loading: settingsLoading } = useSettings();
  const { t } = useSafeTranslation();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const isLoading = servicesLoading || incidentsLoading || settingsLoading;

  const isOperational = activeIncidents.length === 0;
  const statusTitle = isOperational ? t('all_systems_operational') : t('systems_issues_description');
  const StatusIcon = isOperational ? CheckCircle : AlertTriangle;
  const statusColor = isOperational ? 'text-green-500' : 'text-yellow-500';
  const statusBgColor = isOperational ? 'bg-green-500/10' : 'bg-yellow-500/10';
  const statusBorderColor = isOperational ? 'border-green-500/20' : 'border-yellow-500/20';

  const operationalServices = services.filter(s => s.status === 'operational').length;
  const totalServices = services.length;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Fond animé avec gradient moderne */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-[0.02] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <motion.div
        className="relative z-10 container mx-auto px-4 py-8 space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              {t('status_title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('status_description')}
            </p>
          </div>

          {/* Status Overview Card */}
          <motion.div variants={slideInFromLeft} className="max-w-2xl mx-auto">
            <Card className={`${statusBgColor} ${statusBorderColor} border-2 backdrop-blur-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className={`p-3 rounded-full ${statusBgColor} ${statusBorderColor} border`}>
                    <StatusIcon className={`h-8 w-8 ${statusColor}`} />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground">{statusTitle}</h2>
                    <p className="text-muted-foreground">
                      {isOperational 
                        ? `${operationalServices}/${totalServices} services opérationnels`
                        : `${activeIncidents.length} incident(s) actif(s)`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
          <Card className="backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Server className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('total_services')}</p>
                  <p className="text-2xl font-bold">{totalServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('operational_services')}</p>
                  <p className="text-2xl font-bold">{operationalServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('active_incidents')}</p>
                  <p className="text-2xl font-bold">{activeIncidents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div variants={itemVariants} className="grid gap-8 lg:grid-cols-3">
          {/* Services Status - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>{t('services_status')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <ServicesStatus services={services} />
                )}
              </CardContent>
            </Card>

            {/* Incident History */}
            <Card className="backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{t('incident_history')}</span>
                  {activeIncidents.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {activeIncidents.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IncidentHistory />
              </CardContent>
            </Card>

            {/* Uptime History */}
            <Card className="backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>{t('uptime_history')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UptimeHistory 
                  services={services} 
                  selectedServiceId={selectedServiceId} 
                  onServiceChange={setSelectedServiceId} 
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Discord Widget */}
            {getSetting('discord_widget_url') && (
              <motion.div variants={itemVariants}>
                <DiscordWidget />
              </motion.div>
            )}

            {/* System Info */}
            <Card className="backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{t('system_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('last_updated')}</span>
                  <span className="text-sm font-medium">
                    {new Date().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('uptime')}</span>
                  <span className="text-sm font-medium">99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('response_time')}</span>
                  <span className="text-sm font-medium">~50ms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Status;