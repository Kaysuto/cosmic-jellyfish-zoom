import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

type ListType = 'favorite' | 'watchlist';

export const useUserList = (listType: ListType) => {
  const { session } = useSession();
  const { t } = useTranslation();
  const [list, setList] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('user_media_list')
      .select('media_id, media_type')
      .eq('user_id', session.user.id)
      .eq('list_type', listType);
    
    if (error) {
      showError(t('error_fetching_list'));
    } else {
      const newList = new Set(data.map(item => `${item.media_type}:${item.media_id}`));
      setList(newList);
    }
    setLoading(false);
  }, [session, listType, t]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const addToList = async (mediaId: number, mediaType: 'movie' | 'tv' | 'anime') => {
    if (!session?.user) {
      showError(t('must_be_logged_in'));
      return;
    }
    const key = `${mediaType}:${mediaId}`;
    if (list.has(key)) return;

    const { error } = await supabase.from('user_media_list').insert({
      user_id: session.user.id,
      media_id: mediaId,
      media_type: mediaType,
      list_type: listType,
    });

    if (error) {
      showError(t('error_adding_to_list'));
    } else {
      setList(prevList => new Set(prevList).add(key));
      showSuccess(t('added_to_list'));
    }
  };

  const removeFromList = async (mediaId: number, mediaType: 'movie' | 'tv' | 'anime') => {
    if (!session?.user) {
      showError(t('must_be_logged_in'));
      return;
    }
    const key = `${mediaType}:${mediaId}`;
    if (!list.has(key)) return;

    const { error } = await supabase
      .from('user_media_list')
      .delete()
      .eq('user_id', session.user.id)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .eq('list_type', listType);

    if (error) {
      showError(t('error_removing_from_list'));
    } else {
      setList(prevList => {
        const newList = new Set(prevList);
        newList.delete(key);
        return newList;
      });
      showSuccess(t('removed_from_list'));
    }
  };

  const isInList = (mediaId: number, mediaType: 'movie' | 'tv' | 'anime') => {
    return list.has(`${mediaType}:${mediaId}`);
  };

  return { list, loading, addToList, removeFromList, isInList, refetch: fetchList };
};