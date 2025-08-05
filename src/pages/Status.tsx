import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import StatusHeader from '@/components/status/StatusHeader';
import IncidentHistory from '@/components/status/IncidentHistory';
import UptimeHistory from '@/components/status/UptimeHistory';
import { useTranslation } from 'react-i18next';

const StatusPage: React.FC = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'downtime'>('operational');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      } else {
        setServices(servicesData);
        
        // Determine overall status
        const hasDowntime = servicesData.some(s => s.status === 'downtime');
        const hasDegraded = servicesData.some(s => s.status === 'degraded');
        
        if (hasDowntime) {
          setOverallStatus('downtime');
        } else if (hasDegraded) {
          setOverallStatus('degraded');
        } else {
          setOverallStatus('operational');
        }
      }

      // Fetch incidents
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select('*, services(name)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (incidentsError) {
        console.error('Error fetching incidents:', incidentsError);
      } else {
        setIncidents(incidentsData);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white">{t('loading')}...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <StatusHeader overallStatus={overallStatus} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <IncidentHistory incidents={incidents} />
        <UptimeHistory services={services} />
      </div>
    </div>
  );
};

export default StatusPage;