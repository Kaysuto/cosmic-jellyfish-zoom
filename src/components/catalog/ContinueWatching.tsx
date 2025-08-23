import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import MediaCard from './MediaCard';
import { MediaItem } from './MediaGrid';
import { useSession } from '@/contexts/AuthContext';

interface ResumeMediaItem extends MediaItem {
  playback_position_ticks: number;
  runtime_ticks: number;
}

const ContinueWatching = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [items, setItems] = useState<ResumeMediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const fetchResumeItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-jellyfin-resume-items');
        if (error) throw error;
        setItems(data);
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeItems();
  }, [session]);

  if (!session || (!loading && items.length === 0)) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{t('continue_watching')}</h2>
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
            {items.map((item) => {
              const progress = item.runtime_ticks > 0 ? (item.playback_position_ticks / item.runtime_ticks) * 100 : 0;
              return (
                <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                  <MediaCard item={item} showRequestButton={false} progress={progress} />
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      )}
    </section>
  );
};

export default ContinueWatching;