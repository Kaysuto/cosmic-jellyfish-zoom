import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { startOfWeek, endOfWeek, add, sub, format, eachDayOfInterval } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { MediaItem } from '@/components/catalog/MediaGrid';

interface ScheduleCardProps {
  item: MediaItem;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item }) => {
  const title = item.title || item.name;
  return (
    <Link to={`/media/${item.media_type}/${item.id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50">
        <div className="flex items-start gap-3 p-3">
          {item.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
              alt={title}
              className="w-16 h-24 object-cover rounded-md flex-shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-24 bg-muted rounded-md flex-shrink-0" />
          )}
          <div className="flex-grow">
            <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">{title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{item.networks?.[0]?.name}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

const SchedulePage = () => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<Record<string, MediaItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [mediaType, setMediaType] = useState<'tv' | 'anime'>('tv');

  const currentLocale = i18n.language === 'fr' ? fr : enUS;

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

      const groupedByDay = (data as MediaItem[]).reduce((acc, item) => {
        const airDate = item.first_air_date ? format(new Date(item.first_air_date), 'yyyy-MM-dd') : '';
        if (!acc[airDate]) {
          acc[airDate] = [];
        }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const itemsForDay = schedule[dayKey] || [];
            return (
              <div key={dayKey}>
                <h3 className="text-lg font-bold mb-3 capitalize flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  {format(day, 'EEEE d', { locale: currentLocale })}
                </h3>
                <div className="space-y-3">
                  {itemsForDay.length > 0 ? (
                    itemsForDay.map(item => <ScheduleCard key={item.id} item={item} />)
                  ) : (
                    <p className="text-sm text-muted-foreground h-24 flex items-center justify-center">{t('no_releases_on_this_day')}</p>
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