import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import MediaGrid, { MediaItem } from './MediaGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';
import RequestModal from './RequestModal';
import { useSession } from '@/contexts/AuthContext';

interface MediaSectionProps {
  title: string;
  fetchFunction: (params: any) => Promise<{ data: any[], error: any }>;
  mediaType: 'movie' | 'tv';
  showRequestButton?: boolean;
}

const MediaSection = ({ title, fetchFunction, mediaType, showRequestButton = false }: MediaSectionProps) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<MediaItem | null>(null);

  useEffect(() => {
    const loadMedia = async () => {
      setLoading(true);
      try {
        const { data, error } = await fetchFunction({ limit: 12 });
        if (error) throw error;

        const tmdbItems = data.map((item: any) => ({ ...item, media_type: mediaType }));
        const tmdbIds = tmdbItems.map((item: any) => item.id);

        let finalItems = tmdbItems;
        if (tmdbIds.length > 0 && !jellyfinError) {
          const { data: catalogData, error: catalogError } = await supabase
            .from('catalog_items')
            .select('tmdb_id, jellyfin_id')
            .in('tmdb_id', tmdbIds);

          if (!catalogError) {
            const availabilityMap = new Map(catalogData.map(item => [item.tmdb_id, item.jellyfin_id]));
            finalItems = tmdbItems.map((item: any) => ({
              ...item,
              isAvailable: availabilityMap.has(item.id),
              jellyfin_id: availabilityMap.get(item.id),
            }));
          }
        }
        setItems(finalItems);
      } catch (error: any) {
        showError(t('error_fetching_media'), error.message);
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [fetchFunction, mediaType, t, jellyfinError]);

  const openRequestModal = (item: MediaItem) => {
    setSelectedItemForRequest(item);
    setRequestModalOpen(true);
  };

  if (loading) {
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
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <MediaGrid items={items} showRequestButton={showRequestButton && !!session} onRequest={openRequestModal} />
      <RequestModal 
        open={requestModalOpen} 
        onOpenChange={setRequestModalOpen} 
        item={selectedItemForRequest} 
      />
    </div>
  );
};

export default MediaSection;