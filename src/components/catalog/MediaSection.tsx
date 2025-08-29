import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { MediaItem } from './MediaGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { ChevronRight, Film, Tv, Sparkles } from 'lucide-react';
import RequestModal from './RequestModal';
import { useSession } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import MediaCard from './MediaCard';
import { useRequestStatus } from '@/hooks/useRequestStatus';

interface MediaSectionProps {
  title: string;
  fetchFunction: (params: any) => Promise<{ data: any[], error: any }>;
  mediaType: 'movie' | 'tv' | 'anime';
  showRequestButton?: boolean;
  maxItems?: number;
  showViewMore?: boolean;
}

const MediaSection = ({ 
  title, 
  fetchFunction, 
  mediaType, 
  showRequestButton = false, 
  maxItems = 10,
  showViewMore = true 
}: MediaSectionProps) => {
  const { t } = useSafeTranslation();
  const { session } = useSession();
  const { error: jellyfinError } = useJellyfin();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<MediaItem | null>(null);

  // Stabiliser les dépendances pour éviter les boucles infinies
  const stableFetchFunction = useCallback((params: any) => fetchFunction(params), []);
  const stableMediaType = useMemo(() => mediaType, [mediaType]);
  const stableMaxItems = useMemo(() => maxItems, [maxItems]);
  const stableJellyfinError = useMemo(() => jellyfinError, [jellyfinError]);

  useEffect(() => {
    const loadMedia = async () => {
      setLoading(true);
      try {
        const { data, error } = await stableFetchFunction({ limit: stableMaxItems });
        if (error) throw error;

        // Utiliser le media_type réel retourné par l'API, avec fallback sur le paramètre
        const tmdbItems = data.map((item: any) => ({ 
          ...item, 
          media_type: item.media_type || stableMediaType 
        }));
        const itemIds = tmdbItems.map((item: any) => item.id);

        let finalItems = tmdbItems;
        if (itemIds.length > 0 && !stableJellyfinError) {
          const { data: catalogData, error: catalogError } = await supabase
            .from('catalog_items')
            .select('tmdb_id, jellyfin_id')
            .in('tmdb_id', itemIds);

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
        console.error(`[DEBUG] Error loading media:`, error);
        showError(t('error_fetching_media'));
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [stableFetchFunction, stableMediaType, stableMaxItems, stableJellyfinError, t]);

  const openRequestModal = (item: MediaItem) => {
    setSelectedItemForRequest(item);
    setRequestModalOpen(true);
  };

  // Limiter les éléments affichés à maxItems
  const limitedItems = useMemo(() => items.slice(0, maxItems), [items, maxItems]);

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
    switch (mediaType) {
      case 'movie':
        return '/discover/movies';
      case 'tv':
        return '/discover/tv';
      case 'anime':
        return '/discover/anime';
      default:
        return '/catalog';
    }
  }, [mediaType]);

  const getSectionIcon = useCallback(() => {
    switch (mediaType) {
      case 'movie':
        return <Film className="h-6 w-6 text-blue-500" />;
      case 'tv':
        return <Tv className="h-6 w-6 text-green-500" />;
      case 'anime':
        return <Sparkles className="h-6 w-6 text-purple-500" />;
      default:
        return null;
    }
  }, [mediaType]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(maxItems)].map((_, i) => (
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getSectionIcon()}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        {showViewMore && (
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link to={getViewMoreLink()}>
              {t('view_more')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
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
                  showRequestButton={showRequestButton && !!session}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
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

export default MediaSection;