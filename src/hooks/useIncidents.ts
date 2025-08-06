import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Incident {
  id: string;
  service_id: string | null;
  author_id: string | null;
  title: string;
  title_en: string | null;
  description: string;
  description_en: string | null;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  position: number;
  services: { name: string } | null;
  profiles: { first_name: string | null, last_name: string | null, email: string | null, avatar_url: string | null } | null;
}

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = useCallback(async () => {
    const { data, error } = await supabase
      .from('incidents')
      .select('*, services(name), profiles!author_id(first_name, last_name, email, avatar_url)')
      .order('position');
    
    if (error) {
      console.error('Erreur lors de la récupération des incidents:', error);
    } else {
      setIncidents(data as any[] || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchIncidents();

    const channel: RealtimeChannel = supabase
      .channel('incidents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incidents',
        },
        () => {
          fetchIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIncidents]);

  // Fonction pour forcer le rafraîchissement
  const refreshIncidents = useCallback(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return { incidents, loading, refreshIncidents };
};