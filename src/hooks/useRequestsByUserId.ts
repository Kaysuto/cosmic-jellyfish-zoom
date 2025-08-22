import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserMediaRequest {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'available';
  requested_at: string;
  media_type: 'movie' | 'tv' | 'anime';
  poster_path: string | null;
  tmdb_id: number;
}

export const useRequestsByUserId = (userId: string | undefined) => {
  const [requests, setRequests] = useState<UserMediaRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('media_requests')
      .select('id, title, status, requested_at, media_type, poster_path, tmdb_id')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching user requests:', error);
      setRequests([]);
    } else {
      setRequests(data as UserMediaRequest[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, refreshRequests: fetchRequests };
};