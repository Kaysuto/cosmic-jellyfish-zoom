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
import { useJellyfin } from '@/contexts/JellyfinContext';

interface JellyfinLibrary {
  id: string;
  name: string;
  collectionType: string;
}

interface JellyfinLibrarySectionProps {
  library: JellyfinLibrary;
}

const JellyfinLibrarySection: React.FC<JellyfinLibrarySectionProps> = ({ library }) => {
  const { t } = useTranslation();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-jellyfin-library-items', {
          body: { libraryId: library.id, page: 1, limit: 15 },
        });
        if (error) throw error;
        
        const itemsWithAvailability = data.items.map((item: any) => ({
          ...item,
          isAvailable: true,
        }));
        setItems(itemsWithAvailability);
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [library.id]);

  if (jellyfinError) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{library.name}</h2>
        </div>
        <div className="text-red-500 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p>Erreur de configuration Jellyfin : {jellyfinError}</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{library.name}</h2>
        <Button asChild variant="link">
          <Link to={`/discover/${library.collectionType === 'movies' ? 'movie' : 'tv'}`} state={{ libraryName: library.name }}>
            {t('view_all')} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      {loading ? (
        <div className="flex space-x-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-full basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
              <Skeleton className="aspect-[2/3] w-full" />
            </div>
          ))}
        </div>
      ) : (
        <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
          <CarouselContent className="-ml-4">
            {items.map((item) => (
              <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                <MediaCard item={item} showRequestButton={false} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      )}
    </section>
  );
};

export default JellyfinLibrarySection;