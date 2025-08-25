import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { MediaItem } from '@/components/catalog/MediaGrid';

type ListType = 'favorite' | 'watchlist';

export const useUserListDetails = (userId: string, listType: ListType) => {
  const { session } = useSession();
  const { t, i18n } = useTranslation();
  const [list, setList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListDetails = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data: listIds, error: idsError } = await supabase
      .from('user_media_list')
      .select('media_id, media_type')
      .eq('user_id', userId)
      .eq('list_type', listType);

    if (idsError) {
      showError(t('error_fetching_list'));
      setLoading(false);
      return;
    }

    if (listIds.length === 0) {
      setList([]);
      setLoading(false);
      return;
    }

    const { data: detailsData, error: detailsError } = await supabase.functions.invoke('get-media-list-details', {
      body: { mediaList: listIds, language: i18n.language },
    });

    if (detailsError) {
      showError(t('error_fetching_list'));
    } else {
      const items = detailsData.map((item: any) => ({
        ...item,
        media_type: listIds.find(i => i.media_id === item.id)?.media_type
      }));
      setList(items);
    }
    setLoading(false);
  }, [userId, listType, t, i18n.language]);

  useEffect(() => {
    fetchListDetails();
  }, [fetchListDetails]);

  return { list, loading, refetch: fetchListDetails };
};