import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';

export interface ContinueWatchingItem {
  id: number; // tmdb_id
  title?: string;
  name?: string;
  poster_path?: string | null;
  media_type: 'movie' | 'tv';
  progress: number; // as a percentage
  playback_position_ticks: number;
  runtime_ticks: number;
}

export const useContinueWatching = () => {
  const { session } = useSession();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      setItems([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc('get_continue_watching', { p_user_id: session.user.id });
    
    if (error) {
      console.error('Error fetching continue watching items:', error);
      setItems([]);
    } else {
      setItems(data as ContinueWatchingItem[]);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, refresh: fetchItems };
};