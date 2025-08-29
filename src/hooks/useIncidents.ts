import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Incident } from '@/types/status';
import { showError } from '@/utils/toast';

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      
      const formattedData = data.map(incident => {
        return {
          ...incident,
          incident_updates: [], // Table incident_updates n'existe pas encore
          service: null, // Temporairement null jusqu'à ce que la relation soit corrigée
          author_id: incident.author_id ?? null,
        };
      });

      setIncidents(formattedData as unknown as Incident[]);
      setError(null);
    } catch (e: any) {
      const errorMessage = `Erreur lors de la récupération des incidents: ${e.message}`;
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const activeIncidents = useMemo(() => 
    incidents.filter(i => i.status !== 'resolved'),
    [incidents]
  );

  return { incidents, loading, error, fetchIncidents, refreshIncidents: fetchIncidents, activeIncidents };
};