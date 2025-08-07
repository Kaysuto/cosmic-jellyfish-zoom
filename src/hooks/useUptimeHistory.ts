import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { subDays } from 'date-fns';

export type UptimeRecord = {
  date: string;
  uptime_percentage: number;
  avg_response_time_ms: number | null;
};

export const useUptimeHistory = (serviceId: string | null, timeRange: 'day' | 'week' | 'month') => {
  const [uptimeData, setUptimeData] = useState<UptimeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUptimeHistory = async () => {
      if (!serviceId) {
        setUptimeData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const daysToFetch = timeRange === 'month' ? 90 : timeRange === 'week' ? 30 : 7;
      const startDate = subDays(new Date(), daysToFetch);

      const { data, error } = await supabase
        .from('uptime_history')
        .select('date, uptime_percentage, avg_response_time_ms')
        .eq('service_id', serviceId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching uptime history:', error);
        setUptimeData([]);
      } else {
        setUptimeData(data as UptimeRecord[]);
      }
      setLoading(false);
    };

    fetchUptimeHistory();

    const channel: RealtimeChannel = supabase
      .channel(`uptime-history-${serviceId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uptime_history',
          filter: serviceId ? `service_id=eq.${serviceId}` : undefined,
        },
        () => fetchUptimeHistory()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [serviceId, timeRange]);

  return { uptimeData, loading };
};