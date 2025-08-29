import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

export interface ContinueWatchingItem {
  id: number; // tmdb_id
  title?: string;
  name?: string;
  poster_path?: string | null;
  media_type: 'movie' | 'tv' | 'anime';
  progress: number; // as a percentage
  playback_position_ticks: number;
  runtime_ticks: number;
  season_number?: number;
  episode_number?: number;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

export const useContinueWatching = () => {
  const { session } = useSession();
  const { i18n } = useSafeTranslation();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      setItems([]);
      return;
    }

    setLoading(true);
    
    try {
      // Utiliser la nouvelle fonction qui récupère les données complètes comme la Watchlist
      const { data, error } = await supabase.functions.invoke('get-continue-watching-details', {
        body: { 
          userId: session.user.id,
          language: i18n.language 
        }
      });
      
      if (error) {
        console.error('Error fetching continue watching items:', error);
        setItems([]);
      } else {
        setItems(data as ContinueWatchingItem[]);
      }
    } catch (error) {
      console.error('Error fetching continue watching items:', error);
      setItems([]);
    }
    
    setLoading(false);
  }, [session, i18n.language]);

  useEffect(() => {
    fetchItems();

    const handlePlaybackEnded = () => fetchItems();
    const handlePlaybackSaved = (_e: any) => {
      try {
        // When progress is saved we want to refresh the list to avoid stale UI
        fetchItems();
      } catch (err) {
        console.error('Error handling playback-progress-saved in useContinueWatching:', err);
      }
    };

    window.addEventListener('playback-ended', handlePlaybackEnded);
    window.addEventListener('playback-progress-saved', handlePlaybackSaved);

    return () => {
      window.removeEventListener('playback-ended', handlePlaybackEnded);
      window.removeEventListener('playback-progress-saved', handlePlaybackSaved);
    };
  }, [fetchItems]);

  return { items, loading, refresh: fetchItems };
};