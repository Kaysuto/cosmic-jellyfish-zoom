import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar, Plus, CalendarOff } from 'lucide-react';
import { startOfWeek, endOfWeek, add, sub, format, eachDayOfInterval, isToday } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { MediaItem } from '@/components/catalog/MediaGrid';
import ScheduleCard from '@/components/schedule/ScheduleCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useJellyfin } from '@/contexts/JellyfinContext';

const SchedulePage = () => {
  const { t, i18n } = useTranslation();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<Record<string, MediaItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [mediaType, setMediaType] = useState<'tv' | 'anime'>('tv');

  const currentLocale = i18n.language === 'fr' ? fr : enUS;
  const ITEMS_PER_DAY_LIMIT = 3;

  const checkEpisodeExists = async (seriesJellyfinId: string, seasonNumber: number, episodeNumber: number) => {
    try {
      // call edge function; function expects seriesJellyfinId, seasonNumber, episodeNumber
      const { data, error } = await supabase.functions.invoke('check-jellyfin-episode-exists', {
        body: { seriesJellyfinId, seasonNumber, episodeNumber },
      });
      if (error) {
        console.error('check episode func error', error);
        return false;
      }
      return data?.exists === true;
    } catch (e) {
      console.error('checkEpisodeExists', e);
      return false;
    }
  };

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    try {
      const { data, error } = await supabase.functions.invoke('get-airing-schedule', {
        body: {
          mediaType,
          language: i18n.language,
          startDate: format(weekStart, 'yyyy-MM-dd'),
          endDate: format(weekEnd, 'yyyy-MM-dd'),
        },
      });
      if (error) throw error;

      const tmdbItems = data as MediaItem[];
      const tmdbIds = tmdbItems.map(item => item.id);

      // Fetch catalog items including jellyfin_id so we can know if series is synced
      const { data: catalogData, error: catalogError } = await supabase
        .from('catalog_items')
        .select('tmdb_id, jellyfin_id')
        .in('tmdb_id', tmdbIds);

      if (catalogError) {
        console.error("Error checking catalog availability", catalogError);
      }

      const jellyfinMap = new Map<number, string | null>(); // tmdbId -> jellyfin_id
      if (catalogData) {
        for (const c of catalogData) {
          jellyfinMap.set(c.tmdb_id, c.jellyfin_id || null);
        }
      }

      // initial mark: isAvailable only if an episode-level presence is known (we will refine below)
      const itemsWithFlags: MediaItem[] = tmdbItems.map(item => ({
        ...item,
        isAvailable: false,
        isSoon: false,
      }));

      // For TV items that include seasonNumber & episodeNumber, and for which series has a jellyfin_id,
      // check whether the episode exists on Jellyfin. Cache checks per series to avoid repeated calls.
      const seriesCheckCache = new Map<string, Map<string, boolean>>(); // seriesJellyfinId -> map "S:E" -> boolean

      const checkPromises: Promise<void>[] = itemsWithFlags.map(async (it) => {
        if (it.media_type === 'Je vois que la modification de `SchedulePage.tsx` n'a pas été complétée. Je vais terminer cette correction, ainsi que celles des autres composants qui utilisent le contexte Jellyfin.

<dyad-write path="src/pages/Schedule.tsx" description="Terminer la correction de l'affichage des images dans le planning">
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar, Plus, CalendarOff } from 'lucide-react';
import { startOfWeek, endOfWeek, add, sub, format, eachDayOfInterval, isToday } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { MediaItem } from '@/components/catalog/MediaGrid';
import ScheduleCard from '@/components/schedule/ScheduleCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useJellyfin } from '@/contexts/JellyfinContext';

const SchedulePage = () => {
  const { t, i18n } = useTranslation();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<Record<string, MediaItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [mediaType, setMediaType] = useState<'tv' | 'anime'>('tv');

  const currentLocale = i18n.language === 'fr' ? fr : enUS;
  const ITEMS_PER_DAY_LIMIT = 3;

  const checkEpisodeExists = async (seriesJellyfinId: string, seasonNumber: number, episodeNumber: number) => {
    try {
      // call edge function; function expects seriesJellyfinId, seasonNumber, episodeNumber
      const { data, error } = await supabase.functions.invoke('check-jellyfin-episode-exists', {
        body: { seriesJellyfinId, seasonNumber, episodeNumber },
      });
      if (error) {
        console.error('check episode func error', error);
        return false;
      }
      return data?.exists === true;
    } catch (e) {
      console.error('checkEpisodeExists', e);
      return false;
    }
  };

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    try {
      const { data, error } = await supabase.functions.invoke('get-airing-schedule', {
        body: {
          mediaType,
          language: i18n.language,
          startDate: format(weekStart, 'yyyy-MM-dd'),
          endDate: format(weekEnd, 'yyyy-MM-dd'),
        },
      });
      if (error) throw error;

      const tmdbItems = data as MediaItem[];
      const tmdbIds = tmdbItems.map(item => item.id);

      // Fetch catalog items including jellyfin_id so we can know if series is synced
      const { data: catalogData, error: catalogError } = await supabase
        .from('catalog_items')
        .select('tmdb_id, jellyfin_id')
        .in('tmdb_id', tmdbIds);

      if (catalogError) {
        console.error("Error checking catalog availability", catalogError);
      }

      const jellyfinMap = new Map<number, string | null>(); // tmdbId -> jellyfin_id
      if (catalogData) {
        for (const c of catalogData) {
          jellyfinMap.set(c.tmdb_id, c.jellyfin_id || null);
        }
      }

      // initial mark: isAvailable only if an episode-level presence is known (we will refine below)
      const itemsWithFlags: MediaItem[] = tmdbItems.map(item => ({
        ...item,
        isAvailable: false,
        isSoon: false,
      }));

      // For TV items that include seasonNumber & episodeNumber, and for which series has a jellyfin_id,
      // check whether the episode exists on Jellyfin. Cache checks per series to avoid repeated calls.
      const seriesCheckCache = new Map<string, Map<string, boolean>>(); // seriesJellyfinId -> map "S:E" -> boolean

      const checkPromises: Promise<void>[] = itemsWithFlags.map(async (it) => {
        if (it.media_type === 'tv' && it.seasonNumber !== undefined && it.episodeNumber !== undefined) {
          const seriesJellyfinId = jellyfinMap.get(it.id) || null;
          if (seriesJellyfinId) {
            // prepare cache
            if (!seriesCheckCache.has(seriesJellyfinId)) seriesCheckCache.set(seriesJellyfinId, new Map());
            const perSeries = seriesCheckCache.get(seriesJellyfinId)!;
            const key = `${it.seasonNumber}:${it.episodeNumber}`;
            if (perSeries.has(key)) {
              const exists = perSeries.get(key)!;
              if (exists) it.isAvailable = true;
              else it.isSoon = true;
            } else {
              const exists = await checkEpisodeExists(seriesJellyfinId, it.seasonNumber, it.episodeNumber);
              perSeries.set(key, exists);
              if (exists) it.isAvailable = true;
              else it.isSoon = true;
            }
          } else {
            // series not in Jellyfin -> leave both false (no badge)
          }
        } else {
          // For movies or TV without season/episode info, fallback to series-level existence
          const seriesJellyfinId = jellyfinMap.get(it.id) || null;
          if (seriesJellyfinId && it.media_type === 'movie') {
            // If movie exists as a catalog item, consider available
            it.isAvailable = true;
          }
        }
      });

      await Promise.all(checkPromises);

      const groupedByDay = itemsWithFlags.reduce((acc, item) => {
        const airDate = item.first_air_date ? format(new Date(item.first_air_date), 'yyyy-MM-dd') : '';
        if (!acc[airDate]) acc[airDate] = [];
        acc[airDate].push(item);
        return acc;
      }, {} as Record<string, MediaItem[]>);

      setSchedule(groupedByDay);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentDate, mediaType, i18n.language]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const goToPreviousWeek = () => setCurrentDate(sub(currentDate, { weeks: 1 }));
  const goToNextWeek = () => setCurrentDate(add(currentDate, { weeks: 1 }));
  const goToToday = () => setCurrentDate(new Date());

  if (jellyfinError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-red-500 mb-4">
              <h2 className="text-2xl font-bold mb-2">Erreur de configuration</h2>
              <p>Impossible de charger les paramètres Jellyfin : {jellyfinError}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold tracking-tight mb-6">{t('schedule')}</h1>

      <Card className="mb-8 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={goToNextWeek}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={goToToday}>{t('today')}</Button>
          </div>
          <h2 className="text-xl font-semibold text-center">
            {format(weekStart, 'd MMM', { locale: currentLocale })} - {format(weekEnd, 'd MMM yyyy', { locale: currentLocale })}
          </h2>
          <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as 'tv' | 'anime')} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tv">{t('tv_shows')}</TabsTrigger>
              <TabsTrigger value="anime">{t('animes')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-8 w-32" />
              {[...Array(3)].map((_, j) => <Skeleton key={j} className="h-[88px] w-full" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-2">
          {weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const itemsForDay = schedule[dayKey] || [];
            const initialItems = itemsForDay.slice(0, ITEMS_PER_DAY_LIMIT);
            const remainingItems = itemsForDay.slice(ITEMS_PER_DAY_LIMIT);
            const isCurrentDay = isToday(day);

            return (
              <div key={dayKey} className={cn("rounded-lg p-3 transition-colors", isCurrentDay && "bg-primary/10")}>
                <h3 className={cn("text-lg font-bold mb-4 capitalize flex items-center gap-2", isCurrentDay && "text-primary")}>
                  <Calendar className="h-5 w-5" />
                  {format(day, 'EEEE d', { locale: currentLocale })}
                </h3>
                <div className="space-y-2">
                  {initialItems.length > 0 ? (
                    initialItems.map(item => <ScheduleCard key={`${item.id}-${item.first_air_date}`} item={item} />)
                  ) : (
                    <div className="h-24 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/30 rounded-md p-2">
                      <CalendarOff className="h-6 w-6 mb-2" />
                      <p className="text-xs">{t('no_releases_on_this_day')}</p>
                    </div>
                  )}
                  {remainingItems.length > 0 && (
                    <Collapsible>
                      <CollapsibleContent className="space-y-2 animate-in fade-in-0">
                        {remainingItems.map(item => <ScheduleCard key={`${item.id}-${item.first_air_date}`} item={item} />)}
                      </CollapsibleContent>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Voir plus ({remainingItems.length})
                        </Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;