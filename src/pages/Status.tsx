import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

import OverallStatus from '@/components/status/OverallStatus';
import ServicesStatus from '@/components/status/ServicesStatus';
import IncidentHistory from '@/components/status/IncidentHistory';
import UptimeHistory from '@/components/status/UptimeHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Service = {
  id: string;
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'downtime';
  uptime_percentage: number;
  created_at: string;
  updated_at: string;
};

type Incident = {
  id: string;
  service_id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  created_at: string;
  updated_at: string;
  services: { name: string };
};

const Status = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      } else if (servicesData) {
        const typedServices = servicesData as Service[];
        setServices(typedServices);
        if (typedServices.length > 0) {
          setSelectedServiceId(typedServices[0].id);
        }
      }

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select('*, services(name)')
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (incidentsError) {
        console.error('Error fetching incidents:', incidentsError);
      } else if (incidentsData) {
        setIncidents(incidentsData as any);
      }

      if (servicesData && servicesData.length > 0) {
        const mostRecentUpdate = servicesData.reduce((latest, service) => {
          const serviceDate = new Date(service.updated_at);
          return serviceDate > latest ? serviceDate : latest;
        }, new Date(0));
        setLastUpdated(mostRecentUpdate);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

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
      <div className="container mx-auto px-4 py-24">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-8 w-1/4 mb-8" />
        <div className="space-y-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-24"
    >
      <OverallStatus status={overallStatus} lastUpdated={lastUpdated ? `${t('last_updated')} ${formatDistanceToNow(lastUpdated, { addSuffix: true, locale: currentLocale })}` : ''} />

      <div className="mt-12 space-y-8">
        <ServicesStatus services={services} />
        <IncidentHistory incidents={incidents} />
        <UptimeHistory serviceId={selectedServiceId}>
          {services.length > 0 && selectedServiceId && (
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder={t('select_service')} />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {t(service.name.toLowerCase().replace(/ /g, '_'))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </UptimeHistory>
      </div>
    </motion.div>
  );
};

export default Status;