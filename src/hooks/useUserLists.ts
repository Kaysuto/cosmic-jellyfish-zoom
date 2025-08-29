import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

type ListType = 'favorites' | 'watchlist';

export const useUserLists = (userId?: string) => {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [watchlist, setWatchlist] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    if (!userId) {
      setFavorites(new Set());
      setWatchlist(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_media_list')
        .select('media_id, list_type')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user lists:', error);
      } else {
        const favoritesSet = new Set<number>();
        const watchlistSet = new Set<number>();

        data.forEach(item => {
          if (item.list_type === 'favorite') {
            favoritesSet.add(item.media_id);
          } else if (item.list_type === 'watchlist') {
            watchlistSet.add(item.media_id);
          }
        });

        setFavorites(favoritesSet);
        setWatchlist(watchlistSet);
      }
    } catch (error) {
      console.error('Error fetching user lists:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const addToList = async (listType: ListType, mediaId: number, mediaType: 'movie' | 'tv' | 'anime') => {
    if (!userId) {
      showError('Vous devez être connecté');
      return;
    }

    const dbListType = listType === 'favorites' ? 'favorite' : 'watchlist';
    const currentSet = listType === 'favorites' ? favorites : watchlist;

    if (currentSet.has(mediaId)) return;

    const { error } = await supabase.from('user_media_list').insert({
      user_id: userId,
      media_id: mediaId,
      media_type: mediaType,
      list_type: dbListType,
    });

    if (error) {
      showError('Erreur lors de l\'ajout à la liste');
    } else {
      if (listType === 'favorites') {
        setFavorites(prev => new Set(prev).add(mediaId));
      } else {
        setWatchlist(prev => new Set(prev).add(mediaId));
      }
      showSuccess('Ajouté à la liste');
    }
  };

  const removeFromList = async (listType: ListType, mediaId: number) => {
    if (!userId) {
      showError('Vous devez être connecté');
      return;
    }

    const dbListType = listType === 'favorites' ? 'favorite' : 'watchlist';
    const currentSet = listType === 'favorites' ? favorites : watchlist;

    if (!currentSet.has(mediaId)) return;

    const { error } = await supabase
      .from('user_media_list')
      .delete()
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .eq('list_type', dbListType);

    if (error) {
      showError('Erreur lors du retrait de la liste');
    } else {
      if (listType === 'favorites') {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(mediaId);
          return newSet;
        });
      } else {
        setWatchlist(prev => {
          const newSet = new Set(prev);
          newSet.delete(mediaId);
          return newSet;
        });
      }
      showSuccess('Retiré de la liste');
    }
  };

  return {
    favorites,
    watchlist,
    loading,
    addToList,
    removeFromList,
    refetch: fetchLists
  };
};
