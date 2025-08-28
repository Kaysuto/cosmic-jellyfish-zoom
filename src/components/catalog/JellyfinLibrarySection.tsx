import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import MediaGrid, { MediaItem } from './MediaGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

interface JellyfinLibrarySectionProps {
  title: string;
  endpoint: string;
  itemType: 'Movie' | 'Series';
}

const JellyfinLibrarySection = ({ title, endpoint, itemType }: JellyfinLibrarySectionProps) => {
  const { t } = useTranslation();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestAdditions = async () => {
      if (jellyfinError || !jellyfinUrl) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('jellyfin-proxy', {
          body: {
            endpoint: endpoint,
            params: {
              IncludeItemTypes: itemType,
              Limit: 12,
              Fields: 'ProviderIds',
            },
          },
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        const mappedItems: MediaItem[] = data
          .filter((item: any) => item.ProviderIds?.Tmdb)
          .map((item: any) => ({
            id: parseInt(item.ProviderIds.Tmdb, 10),
            title: item.Name,
            name: item.Name,
            poster_path: item.ImageTags?.Primary ? `${jellyfinUrl}/Items/${item.Id}/Images/Primary?tag=${item.ImageTags.Primary}` : '',
            vote_average: item.CommunityRating || 0,
            release_date: item.PremiereDate,
            first_air_date: item.PremiereDate,
            media_type: itemType === 'Movie' ? 'movie' : 'tv',
            isAvailable: true,
            jellyfin_id: item.Id,
          }));
        
        setItems(mappedItems);
      } catch (error: any) {
        showError(t('error_fetching_latest_additions'), error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!jellyfinLoading) {
      fetchLatestAdditions();
    }
  }, [jellyfinLoading, jellyfinError, jellyfinUrl, endpoint, itemType, t]);

  if (jellyfinError) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>{t('jellyfin_error')}</AlertTitle>
        <AlertDescription>{jellyfinError}</AlertDescription>
      </Alert>
    );
  }

  if (loading || jellyfinLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-full aspect-[2/3] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Don't show the section if there's nothing to show
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <MediaGrid items={items} />
    </div>
  );
};

export default JellyfinLibrarySection;