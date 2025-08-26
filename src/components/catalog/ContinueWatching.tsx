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
  const { error: jellyfinError } = useJellyfin();
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
    if (!selectedItem.id || !selectedItem.media_type) {
      console.error('Attempted to resume playback for an item missing id or media_type', selectedItem);
      setDialogOpen(false);
      return;
    }
    const resumeTimeInSeconds = selectedItem.playback_position_ticks / 10000000;
   let url = `/media/${selectedItem.media_type}/${selectedItem.id}/play?t=${resumeTimeInSeconds}`;
   if ((selectedItem.media_type === 'tv' || selectedItem.media_type === 'anime') && selectedItem.season_number && selectedItem.episode_number) {
     url += `&season=${selectedItem.season_number}&episode=${selectedItem.episode_number}`;
   }
   navigate(url);
    setDialogOpen(false);
  };

  const handleRestart = () => {
    if (!selectedItem) return;
    if (!selectedItem.id || !selectedItem.media_type) {
      console.error('Attempted to restart playback for an item missing id or media_type', selectedItem);
      setDialogOpen(false);
      return;
    }
    navigate(`/media/${selectedItem.media_type}/${selectedItem.id}/play`);
    setDialogOpen(false);
  };

  const handleViewDetails = () => {
    if (!selectedItem) return;
    if (!selectedItem.id || !selectedItem.media_type) {
      console.error('Attempted to view details for an item missing id or media_type', selectedItem);
      setDialogOpen(false);
      return;
    }
    navigate(`/media/${selectedItem.media_type}/${selectedItem.id}`);
    setDialogOpen(false);
  };

  // Filter out invalid items (missing id or media_type) to avoid generating invalid routes
  const validItems = Array.isArray(items) ? items.filter(i => i && i.id && i.media_type) : [];

  if (!session || (!loading && validItems.length === 0)) {
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
        ) : (
          <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {validItems.map((item) => {
                return (
                  <CarouselItem key={`${item.media_type}-${item.id}`} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                    <div onClick={(e) => handleCardClick(e, item)} className="cursor-pointer h-full">
                      <MediaCard item={item} showRequestButton={false} progress={item.progress} />
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
      <ResumePlaybackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
        onResume={handleResume}
        onRestart={handleRestart}
        onViewDetails={handleViewDetails}
      />
    </>
  );
};

export default ContinueWatching;