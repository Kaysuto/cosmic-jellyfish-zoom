import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';

export interface NextUpItem {
  id: number; // tmdb_id of the series
  title?: string;
  name?: string;
  poster_path?: string | null;
  media_type: 'tv' | 'anime';
  next_episode_to_watch: {
    season_number: number;
    episode_number: number;
    title: string;
  };
}

export const useNextUp = () => {
  const { session } = useSession();
  const [items, setItems] = useState<NextUpItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      setItems([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc('get_next_up_episodes', { p_user_id: session.user.id });
    
    if (error) {
      console.error('Error fetching next up items:', error);
      setItems([]);
    } else {
      setItems(data as NextUpItem[]);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchItems();

   const handlePlaybackEnded = () => fetchItems();
   window.addEventListener('playback-ended', handlePlaybackEnded);

   return () => {
     window.removeEventListener('playback-ended', handlePlaybackEnded);
   };
  }, [fetchItems]);

  return { items, loading, refresh: fetchItems };
};