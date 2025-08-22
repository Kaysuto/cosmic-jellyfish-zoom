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
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const StatusPage = () => {
  const { t, i18n } = useTranslation();
  const { services, loading: servicesLoading } = useServices();
  const { incidents, loading: incidentsLoading } = useIncidents();
  const { maintenances, loading: maintenancesLoading } = useMaintenances();
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loading = servicesLoading || incidentsLoading || maintenancesLoading;
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

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

  const resolvedIncidents = useMemo(() => {
    return incidents.filter(i => i.status === 'resolved');
  }, [incidents]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-24 w-full" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 flex-grow flex flex-col"
    >
      <OverallStatus status={overallStatus} lastUpdatedText={lastUpdated ? `${t('live_status_last_updated')} ${formatDistanceToNow(lastUpdated, { addSuffix: true, locale: currentLocale })}` : ''} />
      
      <div className="mt-8">
        <ServicesStatus services={services} incidents={incidents} maintenances={maintenances} />
      </div>

      {resolvedIncidents.length > 0 && (
        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="past-incidents">
              <AccordionTrigger className="text-2xl font-bold hover:no-underline">
                {t('past_incidents')}
              </AccordionTrigger>
              <AccordionContent>
                <IncidentHistory incidents={resolvedIncidents} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </motion.div>
  );
};

export default StatusPage;