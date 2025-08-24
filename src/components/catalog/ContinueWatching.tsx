import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useContinueWatching, ContinueWatchingItem } from '@/hooks/useContinueWatching';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import MediaCard from './MediaCard';
import { useSession } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useJellyfin } from '@/contexts/JellyfinContext';
import ResumePlaybackDialog from './ResumePlaybackDialog';

const ContinueWatching = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { items, loading } = useContinueWatching();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContinueWatchingItem | null>(null);

  const handleCardClick = (e: React.MouseEvent, item: ContinueWatchingItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleResume = () => {
    if (!selectedItem) return;
    const resumeTimeInSeconds = selectedItem.playback_position_ticks / 10000000;
    navigate(`/media/${selectedItem.media_type}/${selectedItem.id}/play?t=${resumeTimeInSeconds}`);
    setDialogOpen(false);
  };

  const handleRestart = () => {
    if (!selectedItem) return;
    navigate(`/media/${selectedItem.media_type}/${selectedItem.id}/play`);
    setDialogOpen(false);
  };

  if (!session) {
    return null;
  }

  if (jellyfinError) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">{t('continue_watching')}</h2>
        <div className="text-red-500 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p>Erreur de configuration Jellyfin : {jellyfinError}</p>
        </div>
      </section>
    );
  }

  return (
    <>
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
        ) : items.length > 0 ? (
          <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {items.map((item) => {
                return (
                  <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                    <div onClick={(e) => handleCardClick(e, item)} className="cursor-pointer h-full">
                      <MediaCard item={item} showRequestButton={false} progress={item.progress} playUrl="#" />
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        ) : (
          <p>Aucun élément à afficher dans Reprendre la lecture.</p>
        )}
      </section>
      <ResumePlaybackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
        onResume={handleResume}
        onRestart={handleRestart}
      />
    </>
  );
};

export default ContinueWatching;