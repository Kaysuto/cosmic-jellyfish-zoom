import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { MediaItem } from '@/components/catalog/MediaGrid';

interface ScheduleCardProps {
  item: MediaItem;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item }) => {
  const { t } = useTranslation();
  const title = item.title || item.name;

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
            {item.seasonNumber !== undefined && item.episodeNumber !== undefined && (
              <p className="text-xs text-muted-foreground truncate">
                S{String(item.seasonNumber).padStart(2, '0')} E{String(item.episodeNumber).padStart(2, '0')}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-1 text-xs text-muted-foreground">
              {item.isAvailable && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-none px-2 py-0.5">
                  <Check className="h-3 w-3 mr-1" />
                  {t('series_available')}
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