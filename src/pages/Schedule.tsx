import { useState, useEffect, useCallback } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar, CalendarOff, ChevronDown, ChevronUp } from 'lucide-react';
import { startOfWeek, endOfWeek, add, sub, format, eachDayOfInterval, isToday } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { MediaItem } from '@/components/catalog/MediaGrid';
import ScheduleCard from '@/components/schedule/ScheduleCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useJellyfin } from '@/contexts/JellyfinContext';

const SchedulePage = () => {
  const { t, i18n } = useSafeTranslation();
  const { error: jellyfinError } = useJellyfin();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<Record<string, MediaItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [mediaType, setMediaType] = useState<'tv' | 'anime'>('tv');
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  // Cache pour éviter de recharger les mêmes données
  const [scheduleCache, setScheduleCache] = useState<Record<string, { data: Record<string, MediaItem[]>, timestamp: number }>>({});

  const currentLocale = i18n.language === 'fr' ? fr : enUS;
  const ITEMS_PER_DAY_LIMIT = 3;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes


  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    // Vérifier le cache
    const cacheKey = `${mediaType}-${format(weekStart, 'yyyy-MM-dd')}-${format(weekEnd, 'yyyy-MM-dd')}-${i18n.language}`;
    const cachedData = scheduleCache[cacheKey];
    
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      setSchedule(cachedData.data);
      setLoading(false);
      return;
    }

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

      // Optimisation 1: Les données de disponibilité sont déjà traitées côté serveur
      // Plus besoin de vérifications individuelles d'épisodes

      // Optimisation 2: Filtrage optimisé en une seule passe
      const isAnime = (item: MediaItem) => {
        const genres = item.genre_ids || [];
        const hasAnimeGenre = genres.includes(16);
        const originCountries = item.origin_country || [];
        const isJapanese = originCountries.includes('JP');
        return item.media_type === 'anime' || hasAnimeGenre || isJapanese;
      };

      const filteredItems = tmdbItems.filter(it => {
        if (mediaType === 'anime') return isAnime(it);
        if (mediaType === 'tv') return it.media_type === 'tv' && !isAnime(it);
        return false;
      });

      // Optimisation 3: Groupement optimisé
      const groupedByDay = filteredItems.reduce((acc, item) => {
        const airDate = item.first_air_date ? format(new Date(item.first_air_date), 'yyyy-MM-dd') : '';
        if (!acc[airDate]) acc[airDate] = [];
        acc[airDate].push(item);
        return acc;
      }, {} as Record<string, MediaItem[]>);

      // Mettre en cache les résultats
      setScheduleCache(prev => ({
        ...prev,
        [cacheKey]: { data: groupedByDay, timestamp: Date.now() }
      }));

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

  // Résumé de la semaine : nombre total de sorties
  const totalReleases = Object.values(schedule).reduce((acc, arr) => acc + arr.length, 0);
  const daysWithReleases = Object.values(schedule).filter(arr => arr.length > 0).length;

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
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToPreviousWeek}
              aria-label="Semaine précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNextWeek}
              aria-label="Semaine suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={goToToday}>{t('today')}</Button>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-xl font-semibold text-center">
              {format(weekStart, 'd MMM', { locale: currentLocale })} - {format(weekEnd, 'd MMM yyyy', { locale: currentLocale })}
            </h2>
            <span className="text-xs text-muted-foreground">{t('releases_this_week', { count: totalReleases })} • {t('days_with_releases', { count: daysWithReleases })}</span>
          </div>
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
            const isOpen = openStates[dayKey] || false;

            return (
              <div key={dayKey} className={cn("rounded-lg p-3 transition-colors", isCurrentDay && "bg-primary/10")}>
                <h3 className={cn("text-lg font-bold mb-4 capitalize flex items-center gap-2", isCurrentDay && "text-primary")}>
                  <Calendar className="h-5 w-5" />
                  {format(day, 'EEEE d', { locale: currentLocale })}
                </h3>
                <div className="space-y-2">
                  {initialItems.length > 0 ? (
                    initialItems.map(item => <ScheduleCard key={`${item.id}-${item.first_air_date}`} item={item} currentMediaType={mediaType} />)
                  ) : (
                    <div className="h-24 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/30 rounded-md p-2">
                      <CalendarOff className="h-6 w-6 mb-2" />
                      <p className="text-xs">{t('no_releases_on_this_day')}</p>
                    </div>
                  )}
                  {remainingItems.length > 0 && (
                    <Collapsible open={isOpen} onOpenChange={(open) => setOpenStates(prev => ({...prev, [dayKey]: open}))}>
                      <CollapsibleContent className="space-y-2 animate-in fade-in-0">
                        {remainingItems.map(item => <ScheduleCard key={`${item.id}-${item.first_air_date}`} item={item} currentMediaType={mediaType} />)}
                      </CollapsibleContent>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full mt-2">
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4 mr-2" />
                          ) : (
                            <ChevronDown className="h-4 w-4 mr-2" />
                          )}
                          {isOpen ? t('view_less') : t('view_more', { count: remainingItems.length })}
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