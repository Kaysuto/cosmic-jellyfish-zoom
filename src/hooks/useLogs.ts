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
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Si la table n'existe pas (erreur 404), créer un message d'erreur informatif
        if (error.code === 'PGRST116' || error.message.includes('404') || error.message.includes('relation "logs" does not exist')) {
          console.warn('Table logs non trouvée. Exécutez le script de correction dans Supabase SQL Editor.');
          setError('Table logs non trouvée. Contactez l\'administrateur pour corriger la base de données.');
          setLogs([]);
          return;
        }
        throw new Error(error.message);
      }
      
      setLogs(data || []);
      setError(null);
    } catch (e: any) {
      const errorMessage = "Erreur lors de la récupération des logs.";
      console.error('Erreur useLogs:', e);
      setError(errorMessage);
      showError(errorMessage);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, error, fetchLogs };
};