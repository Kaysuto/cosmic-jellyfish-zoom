import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import MediaCard from './MediaCard';
import { MediaItem } from './MediaGrid';
import RequestModal from './RequestModal';
import { useSession } from '@/contexts/AuthContext';
import { useJellyfin } from '@/contexts/JellyfinContext';

interface MediaSectionProps {
  title: string;
  section: 'animations' | 'animes' | 'films' | 'series';
  sortBy?: string;
}

const MediaSection: React.FC<MediaSectionProps> = ({ title, section, sortBy = 'popularity.desc' }) => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<MediaItem | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('discover-media', {
          body: {
            section,
            language: i18n.language,
            page: 1,
            sortBy,
          },
        });
        if (error) throw error;
        
        const tmdbItems = data.results.slice(0, 15);
        const tmdbIds = tmdbItems.map((item: MediaItem) => item.id);

        if (tmdbIds.length > 0) {
          const { data: catalogData, error: catalogError } = await supabase
            .from('catalog_items')
            .select('tmdb_id')
            .in('tmdb_id', tmdbIds);
          
          if (catalogError) {
            console.error("Error checking catalog availability", catalogError);
            setItems(tmdbItems); // Fallback to showing items without availability
          } else {
            const availableIds = new Set(catalogData.map(item => item.tmdb_id));
            const itemsWithAvailability = tmdbItems.map((item: MediaItem) => ({
              ...item,
              isAvailable: availableIds.has(item.id),
            }));
            setItems(itemsWithAvailability);
          }
        } else {
          setItems(tmdbItems);
        }
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [section, sortBy, i18n.language]);

  const openRequestModal = (item: MediaItem) => {
    setSelectedItemForRequest(item);
    setRequestModalOpen(true);
  };

  if (jellyfinError) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="text-red-500 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p>Erreur de configuration Jellyfin : {jellyfinError}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button asChild variant="link">
          <Link to={`/discover/${section}`}>
            {t('view_all')} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      {loading ? (
        <div className="flex space-x-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-[16.66%] flex-shrink-0">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
          <CarouselContent className="-ml-4">
            {items.map((item) => (
              <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                <MediaCard item={item} onRequest={openRequestModal} showRequestButton={!!session} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      )}
      <RequestModal open={requestModalOpen} onOpenChange={setRequestModalOpen} item={selectedItemForRequest} />
    </section>
  );
};

export default MediaSection;