import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useNextUp, NextUpItem } from '@/hooks/useNextUp';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import MediaCard from './MediaCard';
import { useSession } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const NextUpSection = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { items, loading } = useNextUp();
  const { items: continueItems } = useContinueWatching();

  // IDs récemment terminés/sauvegardés pour surfacer immédiatement le prochain
  const [recentIds, setRecentIds] = useState<Set<number>>(new Set());
  useEffect(() => {
    const handler = (e: any) => {
      const id = Number(e?.detail?.tmdbId);
      const mediaType = e?.detail?.mediaType;
      if (!Number.isFinite(id)) return;
      if (mediaType !== 'tv' && mediaType !== 'anime') return;
      setRecentIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      // expire après 2 minutes
      setTimeout(() => {
        setRecentIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 120000);
    };
    window.addEventListener('playback-progress-saved', handler);
    return () => window.removeEventListener('playback-progress-saved', handler);
  }, []);

  const continueById = useMemo(() => new Map<number, { ratio: number }>(
    (continueItems || []).map(ci => {
      const rt = Number(ci.runtime_ticks || 0);
      const pp = Number(ci.playback_position_ticks || 0);
      const ratio = rt > 0 ? Math.max(0, Math.min(1, pp / rt)) : Math.max(0, Math.min(1, Number(ci.progress || 0) / 100));
      return [ci.id, { ratio }];
    })
  ), [continueItems]);

  // Inclure si ratio >= 0.9 OU si récemment sauvegardé (fin de lecture)
  const filteredItems = items.filter((it) => {
    if (it.media_type !== 'tv' && it.media_type !== 'anime') return false;
    if (recentIds.has(it.id)) return true;
    const c = continueById.get(it.id);
    return !!c && c.ratio >= 0.9;
  });

  // Trier: récents d'abord, puis par ratio décroissant
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const aRecent = recentIds.has(a.id) ? 1 : 0;
      const bRecent = recentIds.has(b.id) ? 1 : 0;
      if (aRecent !== bRecent) return bRecent - aRecent;
      const ar = continueById.get(a.id)?.ratio ?? 0;
      const br = continueById.get(b.id)?.ratio ?? 0;
      return br - ar;
    });
  }, [filteredItems, continueById, recentIds]);

  const handleRemoveFromNextUp = async (item: any) => {
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
        console.error('Error removing from next up:', error);
        return;
      }
      
      // Rafraîchir la liste
      window.dispatchEvent(new CustomEvent('playback-progress-saved', {
        detail: { tmdbId: item.id, mediaType: item.media_type }
      }));
    } catch (err) {
      console.error('Error removing from next up:', err);
    }
  };

  if (!session || (!loading && sortedItems.length === 0)) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{t('next_up')}</h2>
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
              const playUrl = `/media/${item.media_type}/${item.id}/play?season=${season}&episode=${episode}`;
              return (
                <CarouselItem key={`${item.media_type}-${item.id}`} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                  <MediaCard 
                    item={mediaItem} 
                    showRequestButton={false} 
                    showRemoveButton={true}
                    onRemove={handleRemoveFromNextUp}
                    progress={0} 
                    playUrl={playUrl} 
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
  );
};

export default NextUpSection;