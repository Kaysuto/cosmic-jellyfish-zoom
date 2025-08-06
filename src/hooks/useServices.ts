import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface Service {
  id: string;
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'downtime';
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

  return { services, loading };
};