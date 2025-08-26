import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Hourglass } from 'lucide-react';
import { MediaItem } from '@/components/catalog/MediaGrid';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ScheduleCardProps {
  item: MediaItem;
  currentMediaType?: 'tv' | 'anime';
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item, currentMediaType }) => {
  const { t } = useTranslation();
  // Affichage du titre avec numéro d'épisode si dispo
  let title = item.title || item.name;
  if ((item.seasonNumber !== undefined && item.episodeNumber !== undefined) && title) {
    title = `${title} • S${String(item.seasonNumber).padStart(2, '0')}E${String(item.episodeNumber).padStart(2, '0')}`;
  }

  // Différenciation visuelle si c'est un animé dans l'onglet séries (cas rare)
  const isAnime = (() => {
    const genres = item.genre_ids || item.genres || [];
    const hasAnimeGenre = Array.isArray(genres)
      ? genres.some((g) => (typeof g === 'number' && g === 16) || (typeof g === 'object' && g?.id === 16))
      : false;
    const originCountries = item.origin_country || item.origin_countries || [];
    const isJapanese = Array.isArray(originCountries)
      ? originCountries.includes('JP')
      : false;
    return item.media_type === 'anime' || hasAnimeGenre || isJapanese;
  })();

  // Appliquer l'anneau rose seulement si on est dans l'onglet "tv" et que c'est un animé
  const shouldShowAnimeRing = currentMediaType === 'tv' && isAnime;

  return (
    <Link to={`/media/${item.media_type}/${item.id}`} className="block group">
      <Card className={
        `overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 p-2 ${shouldShowAnimeRing ? 'ring-2 ring-pink-400/60' : ''}`
      }>
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
            {/* Le titre contient déjà la saison/épisode si dispo */}
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-1 text-xs text-muted-foreground">
              {/* Show Available only when episode exists (isAvailable === true).
                  Show 'Bientôt' only if isSoon === true (series synced but episode missing).
                  Otherwise show nothing to avoid noise. */}
              {item.isAvailable ? (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-none px-2 py-0.5">
                  <Check className="h-3 w-3 mr-1" />
                  {t('available')}
                </Badge>
              ) : item.isSoon ? (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-none px-2 py-0.5">
                      <Hourglass className="h-3 w-3 mr-1" />
                      {t('soon')}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('soon_available')}</p>
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ScheduleCard;