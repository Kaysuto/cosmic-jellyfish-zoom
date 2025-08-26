import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';

export const useRequestStatus = (mediaIds: number[]) => {
  const { session } = useSession();
  const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequestStatus = async () => {
      if (!session?.user || mediaIds.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const { data, error } = await supabase
        .from('media_requests')
        .select('tmdb_id')
        .in('tmdb_id', mediaIds)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching request status:', error);
      } else {
        setRequestedIds(new Set(data.map(item => item.tmdb_id)));
      }
      setLoading(false);
    };

    fetchRequestStatus();
  }, [mediaIds, session]);

  return { requestedIds, loading };
};