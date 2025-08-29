import { useEffect, useMemo, useState } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Link } from 'react-router-dom';
import { useContinueWatching, ContinueWatchingItem } from '@/hooks/useContinueWatching';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle } from 'lucide-react';
import MediaCard from './MediaCard';
import ResumePlaybackDialog from './ResumePlaybackDialog';
import { useSession } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useJellyfin } from '@/contexts/JellyfinContext';

const ContinueWatching = () => {
  const { t } = useSafeTranslation();
  const { session } = useSession();
  const { items, loading } = useContinueWatching();
  const { error: jellyfinError } = useJellyfin();
  const navigate = useNavigate();

  const [nowPlayingId, setNowPlayingId] = useState<number | null>(null);
  const [lastWatchedId, setLastWatchedId] = useState<number | null>(null);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContinueWatchingItem | null>(null);

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

  const handleItemClick = (item: ContinueWatchingItem) => {
    setSelectedItem(item);
    setResumeDialogOpen(true);
  };

  const handleResume = () => {
    if (selectedItem) {
      // Naviguer vers le lecteur avec la position de reprise
      const resumeTimeInSeconds = Math.floor(selectedItem.playback_position_ticks / 10000000);
      navigate(`/player/${selectedItem.media_type}/${selectedItem.id}?resume=${resumeTimeInSeconds}`);
    }
    setResumeDialogOpen(false);
  };

  const handleRestart = () => {
    if (selectedItem) {
      // Naviguer vers le lecteur sans position de reprise
      navigate(`/player/${selectedItem.media_type}/${selectedItem.id}`);
    }
    setResumeDialogOpen(false);
  };

  const handleViewDetails = () => {
    if (selectedItem) {
      // Naviguer vers la page de détails
      navigate(`/media/${selectedItem.media_type}/${selectedItem.id}`);
    }
    setResumeDialogOpen(false);
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
          <div className="flex items-center gap-3">
            <PlayCircle className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold">{t('continue_watching')}</h2>
          </div>
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
                    <MediaCard
                      item={{
                        ...item,
                        // Affiche l'épisode en cours si disponible (Sxx Exx)
                        title:
                          (item.media_type !== 'movie' && item.season_number && item.episode_number)
                            ? `${item.title || item.name || ''} • S${String(item.season_number).padStart(2,'0')} E${String(item.episode_number).padStart(2,'0')}`
                            : item.title || item.name,
                        media_type: item.media_type === 'anime' ? 'tv' : item.media_type,
                        poster_path: item.poster_path || '',
                        vote_average: item.vote_average || 0,
                      }}
                      showRequestButton={false}
                      onRequest={() => {}} // Fonction vide car pas de demande dans cette section
                      onClick={() => handleItemClick(item as ContinueWatchingItem)}
                    />
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
        open={resumeDialogOpen}
        onOpenChange={setResumeDialogOpen}
        item={selectedItem}
        onResume={handleResume}
        onRestart={handleRestart}
        onViewDetails={handleViewDetails}
      />
    </>
  );
};

export default ContinueWatching;