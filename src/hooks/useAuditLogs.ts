import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface AuditLog {
  id: string;
  created_at: string;
  user_id: string | null;
  action: string;
  details: any;
  profiles: { email: string | null, first_name: string | null, last_name: string | null } | null;
}

export const useAuditLogs = (page: number, perPage: number) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error: fetchError, count } = await supabase
      .from('audit_logs')
      .select('*, profiles(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (fetchError) {
      console.error('Error fetching audit logs:', fetchError);
      setError(fetchError.message);
      setLogs([]);
      setTotalCount(0);
    } else {
      setLogs(data as any[] || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [page, perPage]);

  useEffect(() => {
    fetchLogs();

    const channel: RealtimeChannel = supabase
      .channel('audit-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs',
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  return { logs, loading, error, totalCount, refreshLogs: fetchLogs };
};