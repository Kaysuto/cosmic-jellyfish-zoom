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
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const FeaturedMedia = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const { error: jellyfinError } = useJellyfin();
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
      <div className="container-responsive">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <h2 className="text-3xl font-bold mb-6">{t('home.weekly_trends')}</h2>
          <div className="text-destructive p-6 rounded-xl bg-destructive/10 border border-destructive/20 max-w-md mx-auto">
            <p>{t('errors.jellyfin_configuration')} : {jellyfinError}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="container-responsive">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 rounded-md bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{t('home.weekly_trends')}</h2>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-2.5 w-2.5 text-primary" />
              <span className="text-xs font-medium text-primary">{t('trends')}</span>
            </div>
          </div>
          <Button asChild variant="ghost" className="group hover:bg-accent">
            <Link to="/catalog" className="flex items-center gap-1.5">
              {t('view_all')} 
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </Button>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-media w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Carousel 
              opts={{ 
                align: "start", 
                loop: true,
                skipSnaps: false,
                dragFree: true
              }} 
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {media.map((item, index) => (
                  <CarouselItem 
                    key={item.id} 
                    className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      className="isolate"
                    >
                      <MediaCard
                        item={{...item, isRequested: requestedIds.has(item.id)}}
                        showRequestButton={!!session}
                        onRequest={handleRequest}
                      />
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              <CarouselPrevious className="left-2 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
              <CarouselNext className="right-2 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
            </Carousel>
          </motion.div>
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