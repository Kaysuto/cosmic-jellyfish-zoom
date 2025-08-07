import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  created_at: string;
  user_id: string | null;
  action: string;
  details: any;
  profiles: { email: string | null, first_name: string | null, last_name: string | null } | null;
}

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, profiles(email, first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
    } else {
      setLogs(data as any[] || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, refreshLogs: fetchLogs };
};