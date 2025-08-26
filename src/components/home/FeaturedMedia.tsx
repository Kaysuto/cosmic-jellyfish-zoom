import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import MediaCard from '@/components/catalog/MediaCard';
import { MediaItem } from '@/components/catalog/MediaGrid';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { useRequestStatus } from '@/hooks/useRequestStatus';
import RequestModal from '@/components/catalog/RequestModal';
import { useSession } from '@/contexts/AuthContext';

const FeaturedMedia = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const mediaIds = useMemo(() => media.map(item => item.id), [media]);
  const { requestedIds: initialRequestedIds } = useRequestStatus(mediaIds);
  const [newlyRequestedIds, setNewlyRequestedIds] = useState<Set<number>>(new Set());

  const requestedIds = useMemo(() => {
    return new Set([...Array.from(initialRequestedIds), ...Array.from(newlyRequestedIds)]);
  }, [initialRequestedIds, newlyRequestedIds]);

  const handleRequest = (item: MediaItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const onModalSuccess = () => {
    if (selectedItem) {
      setNewlyRequestedIds(prev => new Set(prev).add(selectedItem.id));
    }
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const { data: trendingData, error } = await supabase.functions.invoke('get-featured-media', {
          body: { language: i18n.language },
        });
        if (error) throw error;

        const tmdbItems = trendingData as MediaItem[];
        const tmdbIds = tmdbItems.map((item) => item.id);

        if (tmdbIds.length > 0) {
          const { data: catalogData, error: catalogError } = await supabase
            .from('catalog_items')
            .select('tmdb_id')
            .in('tmdb_id', tmdbIds);

          if (catalogError) {
            console.error("Error checking catalog availability", catalogError);
            setMedia(tmdbItems);
          } else {
            const availableIds = new Set(catalogData.map(item => item.tmdb_id));
            const itemsWithAvailability = tmdbItems.map((item) => ({
              ...item,
              isAvailable: availableIds.has(item.id),
            }));
            setMedia(itemsWithAvailability);
          }
        } else {
          setMedia(tmdbItems);
        }
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [i18n.language]);

  if (jellyfinError) {
    return (
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">{t('weekly_trends')}</h2>
        <div className="text-red-500 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p>Erreur de configuration Jellyfin : {jellyfinError}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">{t('weekly_trends')}</h2>
        {loading ? (
          <div className="flex space-x-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-full basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                <Skeleton className="aspect-[2/3] w-full" />
              </div>
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {media.map((item) => (
                <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6 pl-4">
                  <MediaCard
                    item={{...item, isRequested: requestedIds.has(item.id)}}
                    showRequestButton={!!session}
                    onRequest={handleRequest}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        )}
      </div>
      <RequestModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={selectedItem}
        onSuccess={onModalSuccess}
      />
    </>
  );
};

export default FeaturedMedia;