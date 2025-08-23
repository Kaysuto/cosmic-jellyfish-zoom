import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Check } from 'lucide-react';
import { MediaItem } from '@/components/catalog/MediaGrid';

interface ScheduleCardProps {
  item: MediaItem;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item }) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;
  const title = item.title || item.name;
  const airTime = item.first_air_date ? format(new Date(item.first_air_date), 'HH:mm', { locale: currentLocale }) : '';

  return (
    <Link to={`/media/${item.media_type}/${item.id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 p-2">
        <div className="flex items-start gap-3">
          {item.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
              alt={title}
              className="w-12 h-[72px] object-cover rounded-md flex-shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-[72px] bg-muted rounded-md flex-shrink-0" />
          )}
          <div className="flex-grow min-w-0">
            <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">{title}</h4>
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />
                {airTime}
              </span>
              {item.isAvailable && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-none px-2 py-0.5">
                  <Check className="h-3 w-3 mr-1" />
                  {t('available')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ScheduleCard;