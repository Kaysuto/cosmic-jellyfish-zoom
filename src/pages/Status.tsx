import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

import { useServices, type Service } from '@/hooks/useServices';
import { useIncidents, type Incident } from '@/hooks/useIncidents';

import OverallStatus from '@/components/status/OverallStatus';
import ServicesStatus from '@/components/status/ServicesStatus';
import IncidentHistory from '@/components/status/IncidentHistory';
import UptimeHistory from '@/components/status/UptimeHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Status = () => {
  const { t, i18n } = useTranslation();
  const { services, loading: servicesLoading } = useServices();
  const { incidents, loading: incidentsLoading } = useIncidents();
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const loading = servicesLoading || incidentsLoading;
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  useEffect(() => {
    if (services && services.length > 0) {
      if (!selectedServiceId) {
        setSelectedServiceId(services[0].id);
      }

      const mostRecentUpdate = services.reduce((latest, service) => {
        const serviceDate = new Date(service.updated_at);
        return serviceDate > latest ? serviceDate : latest;
      }, new Date(0));
      setLastUpdated(mostRecentUpdate);
    }
  }, [services, selectedServiceId]);

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
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-24 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-full w-full min-h-[400px]" />
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
      <OverallStatus status={overallStatus} lastUpdated={lastUpdated ? `${t('last_updated')} ${formatDistanceToNow(lastUpdated, { addSuffix: true, locale: currentLocale })}` : ''} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
        <div className="flex flex-col gap-8">
          <ServicesStatus services={services} />
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
        
        <IncidentHistory incidents={incidents} />
      </div>
    </motion.div>
  );
};

export default Status;
</dyad-file>

<dyad-write path="src/hooks/useServices.ts" description="Adding URL to Service interface">
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface Service {
  id: string;
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'downtime' | 'maintenance';
  uptime_percentage: number;
  created_at: string;
  updated_at: string;
  url: string | null;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Erreur lors de la récupération des services:', error);
      setServices([]);
    } else {
      setServices(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();

    const handleRealtimeUpdate = (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
      console.log('Realtime update received:', payload);
      
      if (payload.eventType === 'UPDATE') {
        const updatedService = payload.new as Service;
        setServices(currentServices =>
          currentServices.map(s => (s.id === updatedService.id ? updatedService : s))
        );
      } else if (payload.eventType === 'INSERT') {
        const newService = payload.new as Service;
        setServices(currentServices => [...currentServices, newService].sort((a, b) => a.name.localeCompare(b.name)));
      } else if (payload.eventType === 'DELETE') {
        const deletedService = payload.old as Partial<Service>;
        console.log('Service deleted:', deletedService.id);
        setServices(currentServices => currentServices.filter(s => s.id !== deletedService.id));
      }
    };

    const channel: RealtimeChannel = supabase
      .channel('services-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchServices]);

  // Fonction pour forcer le rafraîchissement
  const refreshServices = useCallback(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, refreshServices };
};