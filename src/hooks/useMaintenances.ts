import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Maintenance {
  id: string;
  service_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  author_id: string | null;
  services: { name: string } | null;
}

export const useMaintenances = () => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaintenances = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scheduled_maintenances')
      .select('*, services(name)')
      .order('start_time', { ascending: false });
    
    if (error) {
      console.error('Error fetching maintenances:', error);
    } else {
      setMaintenances(data as Maintenance[] || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMaintenances();

    const channel: RealtimeChannel = supabase
      .channel('maintenances-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_maintenances',
        },
        () => {
          fetchMaintenances();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMaintenances]);

  return { maintenances, loading, refreshMaintenances: fetchMaintenances };
};