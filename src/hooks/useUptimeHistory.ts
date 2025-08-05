import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UptimeDataPoint {
  id: string;
  service_id: string;
  date: string;
  uptime_percentage: number;
  created_at: string;
}

export const useUptimeHistory = (serviceId?: string) => {
  const [uptimeData, setUptimeData] = useState<UptimeDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupération initiale de l'historique de disponibilité
    const fetchUptimeHistory = async () => {
      let query = supabase
        .from('uptime_history')
        .select('*')
        .order('date', { ascending: true });
      
      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erreur lors de la récupération de l\'historique de disponibilité:', error);
      } else {
        setUptimeData(data || []);
      }
      setLoading(false);
    };

    fetchUptimeHistory();

    // Abonnement aux changements en temps réel
    const channel: RealtimeChannel = supabase
      .channel('uptime-history-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'uptime_history',
        },
        (payload) => {
          setUptimeData((prev) => [...prev, payload.new as UptimeDataPoint]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'uptime_history',
        },
        (payload) => {
          setUptimeData((prev) =>
            prev.map((dataPoint) =>
              dataPoint.id === payload.new.id ? (payload.new as UptimeDataPoint) : dataPoint
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'uptime_history',
        },
        (payload) => {
          setUptimeData((prev) => prev.filter((dataPoint) => dataPoint.id !== payload.old.id));
        }
      )
      .subscribe();

    // Nettoyage de l'abonnement lors du démontage du composant
    return () => {
      supabase.removeChannel(channel);
    };
  }, [serviceId]);

  return { uptimeData, loading };
};