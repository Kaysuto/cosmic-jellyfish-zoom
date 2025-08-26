import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNextUp, NextUpItem } from '@/hooks/useNextUp';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import MediaCard from './MediaCard';
import { useSession } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NextUpSection = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { items, loading } = useNextUp();
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent, item: NextUpItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item.id || !item.media_type || !item.next_episode_to_watch) {
      console.error('Attempted to navigate for an item missing id, media_type, or next_episode_to_watch', item);
      return;
    }
    const ep = item.next_episode_to_watch as any;
    const season = ep?.season_number ?? ep?.seasonNumber;
    const episode = ep?.episode_number ?? ep?.episodeNumber;
    if (!season || !episode) {
      console.error('Next episode information incomplete', ep);
      return;
    }
    navigate(`/media/${item.media_type}/${item.id}/play?season=${season}&episode=${episode}`);
  };

  if (!session || (!loading && items.length === 0)) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{t('next_up')}</h2>
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
              const ep = item.next_episode_to_watch as any;
              const season = ep?.season_number ?? ep?.seasonNumber;
              const episode = ep?.episode_number ?? ep?.episodeNumber;
              const episodeTitle = ep?.title ?? `${item.title} S${season} E${episode}`;
              const poster = ep?.still_path ?? item.poster_path;
              const mediaItem = {
                ...item,
                title: episodeTitle,
                poster_path: poster,
              } as any;
              return (
                <CarouselItem key={`${item.media_type}-${item.id}`} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                  <div onClick={(e) => handleCardClick(e, item)} className="cursor-pointer h-full">
                    <MediaCard item={mediaItem} showRequestButton={false} progress={0} />
                  </div>
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

export default NextUpSection;