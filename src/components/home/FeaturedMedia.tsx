import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Film } from 'lucide-react';

interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
}

const FeaturedMedia = () => {
  const { t, i18n } = useTranslation();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-featured-media', {
          body: { language: i18n.language },
        });
        if (error) throw error;
        setMedia(data);
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [i18n.language]);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-6">{t('weekly_trends')}</h2>
      {loading ? (
        <div className="flex space-x-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[300px] w-[200px]" />)}
        </div>
      ) : (
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent>
            {media.map((item) => (
              <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                <Link to={`/media/${item.media_type}/${item.id}`}>
                  <Card className="overflow-hidden transition-transform hover:scale-105">
                    <CardContent className="p-0 aspect-[2/3]">
                      {item.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title || item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          <Film className="h-12 w-12" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      )}
    </div>
  );
};

export default FeaturedMedia;