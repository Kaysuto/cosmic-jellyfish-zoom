import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

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

  useEffect(() => {
    // Récupération initiale des services
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erreur lors de la récupération des services:', error);
      } else {
        setServices(data || []);
      }
      setLoading(false);
    };

    fetchServices();

    // Abonnement aux changements en temps réel
    const channel: RealtimeChannel = supabase
      .channel('services-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'services',
        },
        (payload) => {
          setServices((prev) => [...prev, payload.new as Service]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'services',
        },
        (payload) => {
          setServices((prev) =>
            prev.map((service) =>
              service.id === payload.new.id ? (payload.new as Service) : service
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'services',
        },
        (payload) => {
          setServices((prev) => prev.filter((service) => service.id !== payload.old.id));
        }
      )
      .subscribe();

    // Nettoyage de l'abonnement lors du démontage du composant
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { services, loading };
};