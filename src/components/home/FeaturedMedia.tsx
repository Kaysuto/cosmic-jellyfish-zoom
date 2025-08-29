import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
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
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';

const FeaturedMedia = () => {
  const { t, i18n } = useSafeTranslation();
  const { session } = useSession();
  const { error: jellyfinError } = useJellyfin();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<MediaItem | null>(null);

  // Stabiliser les dépendances pour éviter les boucles infinies
  const stableLanguage = useMemo(() => i18n.language, [i18n.language]);
  const stableJellyfinError = useMemo(() => jellyfinError, [jellyfinError]);

  useEffect(() => {
    const loadMedia = async () => {
      setLoading(true);
      try {
        const { data: trendingData, error } = await supabase.functions.invoke('get-featured-media', {
          body: { language: stableLanguage },
        });
        if (error) throw error;

        const tmdbItems = trendingData as MediaItem[];
        const itemIds = tmdbItems.map((item) => item.id);

        let finalItems = tmdbItems;
        if (itemIds.length > 0 && !stableJellyfinError) {
          const { data: catalogData, error: catalogError } = await supabase
            .from('catalog_items')
            .select('tmdb_id, jellyfin_id')
            .in('tmdb_id', itemIds);

          if (!catalogError) {
            const availabilityMap = new Map(catalogData.map(item => [item.tmdb_id, item.jellyfin_id]));
            finalItems = tmdbItems.map((item) => ({
              ...item,
              isAvailable: availabilityMap.has(item.id),
              jellyfin_id: availabilityMap.get(item.id),
            }));
          }
        }
        
        setItems(finalItems);
      } catch (error: any) {
        console.error('Error loading featured media:', error);
        showError(t('error_fetching_media'));
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [stableLanguage, stableJellyfinError]);

  const openRequestModal = (item: MediaItem) => {
    setSelectedItemForRequest(item);
    setRequestModalOpen(true);
  };

  // Limiter les éléments affichés à 10
  const limitedItems = useMemo(() => items.slice(0, 10), [items]);

  // Utiliser seulement les IDs des éléments limités pour éviter les requêtes trop longues
  const requestMediaIds = useMemo(() => limitedItems.map(item => item.id), [limitedItems]);
  const { requestedIds, addRequestedIdAndRefresh, forceRefresh } = useRequestStatus(requestMediaIds);

  const onModalSuccess = useCallback(() => {
    if (selectedItemForRequest) {
      // Si l'item est déjà marqué comme demandé, forcer le rafraîchissement
      if (selectedItemForRequest.isRequested) {
        forceRefresh();
      } else {
        addRequestedIdAndRefresh(selectedItemForRequest.id);
      }
    }
  }, [selectedItemForRequest, forceRefresh, addRequestedIdAndRefresh]);

  const getViewMoreLink = useCallback(() => {
    return '/catalog';
  }, []);

  if (loading) {
    return (
      <div className="container-responsive">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-bold">{t('home.weekly_trends')}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
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
    <div className="container-responsive">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-bold">{t('home.weekly_trends')}</h2>
        </div>
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <Link to={getViewMoreLink()}>
            {t('view_more')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="relative">
        <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
          <CarouselContent className="-ml-4">
            {limitedItems.map((item) => (
              <CarouselItem key={`${item.id}-${item.media_type}`} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                <MediaCard
                  item={{
                    ...item,
                    poster_path: item.poster_path || '',
                    vote_average: item.vote_average || 0,
                    media_type: item.media_type === 'anime' ? 'tv' : item.media_type,
                    isRequested: requestedIds.has(item.id)
                  }}
                  onRequest={openRequestModal}
                  showRequestButton={!!session}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="flex" />
          <CarouselNext className="flex" />
        </Carousel>
      </div>
      
      <RequestModal 
        open={requestModalOpen} 
        onOpenChange={setRequestModalOpen} 
        item={selectedItemForRequest}
        onSuccess={onModalSuccess}
      />
    </div>
  );
};

export default FeaturedMedia;