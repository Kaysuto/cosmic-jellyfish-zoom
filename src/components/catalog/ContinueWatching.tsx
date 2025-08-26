import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useContinueWatching, ContinueWatchingItem } from '@/hooks/useContinueWatching';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import MediaCard from './MediaCard';
import { useSession } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useJellyfin } from '@/contexts/JellyfinContext';
import ResumePlaybackDialog from './ResumePlaybackDialog';
import { supabase } from '@/integrations/supabase/client';

const ContinueWatching = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { items, loading } = useContinueWatching();
  const { error: jellyfinError } = useJellyfin();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContinueWatchingItem | null>(null);
  const [nowPlayingId, setNowPlayingId] = useState<number | null>(null);
  const [lastWatchedId, setLastWatchedId] = useState<number | null>(null);

  useEffect(() => {
    // Récupérer le dernier média regardé depuis localStorage
    const stored = localStorage.getItem('lastWatchedMediaId');
    if (stored) {
      const id = Number(stored);
      if (Number.isFinite(id)) setLastWatchedId(id);
    }
  }, []);

  useEffect(() => {
    const onSaved = (e: any) => {
      const id = Number(e?.detail?.tmdbId);
      if (Number.isFinite(id)) {
        setNowPlayingId(id);
        setLastWatchedId(id);
        localStorage.setItem('lastWatchedMediaId', id.toString());
      }
    };
    window.addEventListener('playback-progress-saved', onSaved);
    return () => window.removeEventListener('playback-progress-saved', onSaved);
  }, []);

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

  const handleRemoveFromContinueWatching = async (item: ContinueWatchingItem) => {
    if (!session?.user || !item.id || !item.media_type) return;
    
    try {
      // Supprimer toutes les entrées de playback_progress pour ce média
      const { error } = await supabase
        .from('playback_progress')
        .delete()
        .eq('user_id', session.user.id)
        .eq('tmdb_id', item.id)
        .eq('media_type', item.media_type);
      
      if (error) {
        console.error('Error removing from continue watching:', error);
        return;
      }
      
      // Rafraîchir la liste
      window.dispatchEvent(new CustomEvent('playback-progress-saved', {
        detail: { tmdbId: item.id, mediaType: item.media_type }
      }));
    } catch (err) {
      console.error('Error removing from continue watching:', err);
    }
  };

  const handleRemoveWrapper = (mediaItem: any) => {
    // Trouver l'item correspondant dans sortedItems
    const continueItem = sortedItems.find(item => item.id === mediaItem.id && item.media_type === mediaItem.media_type);
    if (continueItem) {
      handleRemoveFromContinueWatching(continueItem);
    }
  };

  // Filter out invalid items (missing id or media_type) to avoid generating invalid routes
  const validItems = useMemo(() => (Array.isArray(items) ? items.filter(i => i && i.id && i.media_type) : []), [items]);

  const sortedItems = useMemo(() => {
    const proximity = (it: ContinueWatchingItem) => {
      const rt = Number(it.runtime_ticks || 0);
      const pp = Number(it.playback_position_ticks || 0);
      if (rt > 0) return Math.max(0, Math.min(1, pp / rt));
      return Math.max(0, Math.min(1, Number(it.progress || 0) / 100));
    };
    const arr = [...validItems].sort((a, b) => {
      // Priorité 1: ce qui est en cours de lecture
      if (nowPlayingId && a.id === nowPlayingId && b.id !== nowPlayingId) return -1;
      if (nowPlayingId && b.id === nowPlayingId && a.id !== nowPlayingId) return 1;
      
      // Priorité 2: le dernier média regardé
      if (lastWatchedId && a.id === lastWatchedId && b.id !== lastWatchedId) return -1;
      if (lastWatchedId && b.id === lastWatchedId && a.id !== lastWatchedId) return 1;
      
      // Priorité 3: ce qui est le plus proche de la fin (ratio élevé)
      const aRatio = proximity(a);
      const bRatio = proximity(b);
      
      // Seuil minimum: ne pas prioriser les médias avec < 5% de progression
      const MIN_PROGRESS = 0.05;
      if (aRatio < MIN_PROGRESS && bRatio >= MIN_PROGRESS) return 1;
      if (bRatio < MIN_PROGRESS && aRatio >= MIN_PROGRESS) return -1;
      
      return bRatio - aRatio;
    });
    return arr;
  }, [validItems, nowPlayingId, lastWatchedId]);

  if (!session || (!loading && sortedItems.length === 0)) {
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{t('continue_watching')}</h2>
          <Button asChild variant="link">
            <Link to="/catalog">
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
              {sortedItems.map((item) => {
                return (
                  <CarouselItem key={`${item.media_type}-${item.id}`} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                    <div onClick={(e) => handleCardClick(e, item)} className="cursor-pointer">
                      <MediaCard
                        item={{
                          ...item,
                          // Affiche l'épisode en cours si disponible (Sxx Exx)
                          title:
                            (item.media_type !== 'movie' && item.season_number && item.episode_number)
                              ? `${item.title || item.name || ''} • S${String(item.season_number).padStart(2,'0')} E${String(item.episode_number).padStart(2,'0')}`
                              : item.title || item.name,
                        } as any}
                        showRequestButton={false}
                        showRemoveButton={true}
                        onRemove={handleRemoveWrapper}
                        progress={item.progress}
                        playbackPositionTicks={item.playback_position_ticks}
                        runtimeTicks={item.runtime_ticks}
                      />
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