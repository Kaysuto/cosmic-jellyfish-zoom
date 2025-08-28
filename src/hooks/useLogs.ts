import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Log } from '@/types/supabase';
import { showError } from '@/utils/toast';

export const useLogs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      setLogs(data || []);
      setError(null);
    } catch (e: any) {
      const errorMessage = "Erreur lors de la récupération des logs.";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, error, fetchLogs };
};