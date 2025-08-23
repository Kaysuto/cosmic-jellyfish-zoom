import React from 'react';
import { useTranslation } from 'react-i18next';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import MediaCard from './MediaCard';
import { useSession } from '@/contexts/AuthContext';

const ContinueWatching = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { items, loading } = useContinueWatching();

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
            {items.map((item) => (
              <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                <MediaCard item={item} showRequestButton={false} progress={item.progress} />
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

export default ContinueWatching;