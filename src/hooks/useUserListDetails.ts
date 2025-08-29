import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError } from '@/utils/toast';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { MediaItem } from '@/components/catalog/MediaGrid';

type ListType = 'favorite' | 'watchlist';

export const useUserListDetails = (userId: string, listType: ListType) => {
  const { session } = useSession();
  const { t, i18n } = useSafeTranslation();
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
      // Fetch availability from catalog_items to ensure up-to-date availability
      const tmdbIds = listIds.map(i => i.media_id);
      const { data: catalog, error: catalogError } = await supabase
        .from('catalog_items')
        .select('tmdb_id, media_type, jellyfin_id')
        .in('tmdb_id', tmdbIds);

      const availabilityKey = (id: number, mediaType?: string) => `${id}:${mediaType || ''}`;
      const availability = new Map<string, boolean>();
      if (!catalogError && catalog) {
        for (const row of catalog) {
          availability.set(availabilityKey(row.tmdb_id, row.media_type), !!row.jellyfin_id);
        }
      }

      const items = detailsData.map((item: any) => {
        const mediaType = listIds.find(i => i.media_id === item.id)?.media_type;
        const isAvailable = availability.get(availabilityKey(item.id, mediaType)) || false;
        return { ...item, media_type: mediaType, isAvailable } as MediaItem;
      });
      setList(items);
    }
    setLoading(false);
  }, [userId, listType, t, i18n.language]);

  useEffect(() => {
    fetchListDetails();
  }, [fetchListDetails]);

  return { list, loading, refetch: fetchListDetails };
};