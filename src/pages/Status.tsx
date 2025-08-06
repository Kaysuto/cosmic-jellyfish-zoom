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

  const historicalIncidents: Incident[] = [
    {
      id: 'hist-1',
      service_id: 'd8f8b8f8-8f8f-8f8f-8f8f-8f8f8f8f8f8f',
      title: 'Dégradation des performances du streaming',
      description: 'Nous avons observé des lenteurs et des mises en mémoire tampon sur le service de streaming principal. Le problème a été identifié et résolu.',
      status: 'resolved',
      created_at: '2025-01-15T14:00:00Z',
      updated_at: '2025-01-15T18:30:00Z',
      services: { name: 'streaming_service' },
    },
    {
      id: 'hist-2',
      service_id: 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6',
      title: 'Panne partielle du service VOD',
      description: 'Le service de demande de films et séries était inaccessible pour certains utilisateurs. La cause racine a été corrigée.',
      status: 'resolved',
      created_at: '2025-02-20T09:10:00Z',
      updated_at: '2025-02-20T11:45:00Z',
      services: { name: 'vod_service' },
    },
    {
      id: 'hist-3',
      service_id: 'b2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7',
      title: 'Problèmes de connexion au service des comptes',
      description: 'Une erreur de base de données empêchait les nouvelles connexions. Le système a été restauré.',
      status: 'resolved',
      created_at: '2025-03-05T22:00:00Z',
      updated_at: '2025-03-06T01:15:00Z',
      services: { name: 'accounts_service' },
    },
  ];

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

      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select('*, services(name)')
        .order('created_at', { ascending: false });

      if (incidentsError) {
        console.error('Error fetching incidents:', incidentsError);
      } else if (incidentsData) {
        const allIncidents = [...historicalIncidents, ...(incidentsData as any[])];
        allIncidents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setIncidents(allIncidents);
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