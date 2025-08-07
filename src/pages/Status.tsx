import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

import { useServices } from '@/hooks/useServices';
import { useIncidents } from '@/hooks/useIncidents';
import { useMaintenances } from '@/hooks/useMaintenances';

import OverallStatus from '@/components/status/OverallStatus';
import ServicesStatus from '@/components/status/ServicesStatus';
import IncidentHistory from '@/components/status/IncidentHistory';
import UptimeHistory from '@/components/status/UptimeHistory';
import ScheduledMaintenances from '@/components/status/ScheduledMaintenances';
import { Skeleton } from '@/components/ui/skeleton';

const StatusPage = () => {
  const { t, i18n } = useTranslation();
  const { services, loading: servicesLoading } = useServices();
  const { incidents, loading: incidentsLoading } = useIncidents();
  const { maintenances, loading: maintenancesLoading } = useMaintenances();
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const loading = servicesLoading || incidentsLoading || maintenancesLoading;
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  useEffect(() => {
    if (services && services.length > 0 && !selectedServiceId) {
      const initialService = services.find(s => s.url) || services[0];
      if (initialService) {
        setSelectedServiceId(initialService.id);
      }
    }
  }, [services, selectedServiceId]);

  useEffect(() => {
    if (services && services.length > 0) {
      const mostRecentUpdate = services.reduce((latest, service) => {
        const serviceDate = new Date(service.updated_at);
        return serviceDate > latest ? serviceDate : latest;
      }, new Date(0));
      setLastUpdated(mostRecentUpdate);
    }
  }, [services]);

  const overallStatus = useMemo(() => {
    if (services.length === 0) return 'all_systems_operational';
    const hasDowntime = services.some(s => s.status === 'downtime');
    if (hasDowntime) return 'major_outage';
    const hasDegraded = services.some(s => s.status === 'degraded');
    if (hasDegraded) return 'partial_outage';
    return 'all_systems_operational';
  }, [services]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="space-y-8">
        <OverallStatus status={overallStatus} lastUpdatedText={lastUpdated ? `${t('live_status_last_updated')} ${formatDistanceToNow(lastUpdated, { addSuffix: true, locale: currentLocale })}` : ''} />
        
        <ScheduledMaintenances maintenances={maintenances} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ServicesStatus services={services} />
          <IncidentHistory incidents={incidents} />
        </div>
        
        <UptimeHistory 
          services={services}
          selectedServiceId={selectedServiceId}
          onServiceChange={setSelectedServiceId}
        />
      </div>
    </motion.div>
  );
};

export default StatusPage;