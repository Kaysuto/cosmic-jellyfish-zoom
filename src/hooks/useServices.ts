import { useState, useEffect, useCallback, useMemo } from 'react';
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
  position: number;
  last_response_time_ms: number | null;
  ip_address: string | null;
  port: number | null;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('position');
    
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
      fetchServices(); // Re-fetch to get the correct order
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

  // Mémoisation des données calculées pour éviter les re-renders
  const operationalServices = useMemo(() => 
    services.filter(s => s.status === 'operational'), 
    [services]
  );

  const problematicServices = useMemo(() => 
    services.filter(s => s.status === 'downtime' || s.status === 'degraded'), 
    [services]
  );

  const maintenanceServices = useMemo(() => 
    services.filter(s => s.status === 'maintenance'), 
    [services]
  );

  const averageUptime = useMemo(() => {
    if (services.length === 0) return 0;
    const total = services.reduce((sum, service) => sum + service.uptime_percentage, 0);
    return Math.round(total / services.length);
  }, [services]);

  return { 
    services, 
    loading, 
    refreshServices,
    operationalServices,
    problematicServices,
    maintenanceServices,
    averageUptime
  };
};