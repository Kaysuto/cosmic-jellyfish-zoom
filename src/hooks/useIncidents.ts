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
        .select(`
          *,
          incident_updates (*),
          services (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      
      const formattedData = data.map(incident => {
        let affectedService = null;
        if (Array.isArray(incident.services)) {
          affectedService = incident.services.length > 0 ? incident.services[0] : null;
        } else if (incident.services) {
          affectedService = incident.services;
        }
        
        return {
          ...incident,
          incident_updates: Array.isArray(incident.incident_updates) ? incident.incident_updates : [],
          service: affectedService,
          services: undefined
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