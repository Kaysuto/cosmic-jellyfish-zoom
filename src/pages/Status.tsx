import { useServices } from '@/hooks/useServices';
import { useIncidents } from '@/hooks/useIncidents';
import { useTranslation } from 'react-i18next';
import ServiceStatus from '@/components/status/ServiceStatus';
import IncidentHistory from '@/components/status/IncidentHistory';
import UptimeGraph from '@/components/status/UptimeGraph';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '@/hooks/useSettings';
import CustomAudioPlayer from '@/components/media/CustomAudioPlayer';
import DiscordWidget from '@/components/community/DiscordWidget';

const Status = () => {
  const { services, loading: servicesLoading } = useServices();
  const { incidents, loading: incidentsLoading, activeIncidents } = useIncidents();
  const { settings, loading: settingsLoading } = useSettings();
  const { t } = useTranslation();

  const isLoading = servicesLoading || incidentsLoading || settingsLoading;

  const isOperational = activeIncidents.length === 0;
  const statusTitle = isOperational ? t('all_systems_operational') : t('systems_issues_description');
  const StatusIcon = isOperational ? CheckCircle : AlertTriangle;
  const statusColor = isOperational ? 'text-green-500' : 'text-yellow-500';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header variants={itemVariants} className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">{t('status_title')}</h1>
          <div className={`mt-4 flex items-center justify-center space-x-2 ${statusColor}`}>
            <StatusIcon className="h-6 w-6" />
            <p className="text-lg font-semibold">{statusTitle}</p>
          </div>
        </motion.header>

        <motion.div variants={itemVariants} className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('services_status')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map(service => (
                    <ServiceStatus key={service.id} service={service} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <IncidentHistory />
          </div>
          <div className="space-y-8">
            {settings.discord_widget_url && <DiscordWidget serverUrl={settings.discord_widget_url} />}
            {settings.custom_audio_url && <CustomAudioPlayer audioSrc={settings.custom_audio_url} />}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <UptimeGraph />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Status;