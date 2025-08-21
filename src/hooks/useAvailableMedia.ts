import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AvailableMedia {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'available';
  poster_path: string;
  release_date: string;
  media_type: 'movie' | 'tv' | 'anime';
  tmdb_id: number;
  updated_at: string;
}

export const useAvailableMedia = () => {
  const [media, setMedia] = useState<AvailableMedia[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('media_requests')
      .select('*')
      .eq('status', 'available')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching available media:', error);
      setMedia([]);
    } else {
      setMedia(data as AvailableMedia[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return { media, loading, refreshMedia: fetchMedia };
};