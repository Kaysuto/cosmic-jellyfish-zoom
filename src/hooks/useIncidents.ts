import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Incident {
  id: string;
  service_id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  created_at: string;
  updated_at: string;
}

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupération initiale des incidents
    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors de la récupération des incidents:', error);
      } else {
        setIncidents(data || []);
      }
      setLoading(false);
    };

    fetchIncidents();

    // Abonnement aux changements en temps réel
    const channel: RealtimeChannel = supabase
      .channel('incidents-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incidents',
        },
        (payload) => {
          setIncidents((prev) => [payload.new as Incident, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'incidents',
        },
        (payload) => {
          setIncidents((prev) =>
            prev.map((incident) =>
              incident.id === payload.new.id ? (payload.new as Incident) : incident
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'incidents',
        },
        (payload) => {
          setIncidents((prev) => prev.filter((incident) => incident.id !== payload.old.id));
        }
      )
      .subscribe();

    // Nettoyage de l'abonnement lors du démontage du composant
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { incidents, loading };
};