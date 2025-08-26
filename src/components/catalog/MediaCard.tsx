import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Film, Star, Plus, Check, Heart, Bookmark, Hourglass } from 'lucide-react';
import { useUserList } from '@/hooks/useUserList';
import { useSession } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import type { MediaItem } from './MediaGrid';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { Badge } from '@/components/ui/badge';

interface MediaCardProps {
  item: MediaItem;
  showRequestButton?: boolean;
  onRequest?: (item: MediaItem) => void;
  searchTerm?: string;
  progress?: number;
  playUrl?: string;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, showRequestButton = true, onRequest, searchTerm, progress, playUrl }) => {
  const { t } = useTranslation();
  const { jellyfinUrl } = useJellyfin();

  const { session } = useSession();
  const { addToList: addToFavorites, removeFromList: removeFromFavorites, isInList: isInFavorites } = useUserList('favorite');
  const { addToList: addToWatchlist, removeFromList: removeFromWatchlist, isInList: isInWatchlist } = useUserList('watchlist');
  const title = item.title || item.name || 'No title';
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const rating = item.vote_average ?? null;
  const isAvailable = item.isAvailable;
  
  const mediaTypeForLink = item.media_type === 'anime' ? 'tv' : item.media_type;
  const linkTo = playUrl || (searchTerm
    ? `/media/${mediaTypeForLink}/${item.id}?fromSearch=${encodeURIComponent(searchTerm)}`
    : `/media/${mediaTypeForLink}/${item.id}`);

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    }
    if (jellyfinUrl && path.startsWith('Items/')) {
      return `${jellyfinUrl}/${path}`;
    }
    return path;
  };

  const imageUrl = getImageUrl(item.poster_path);

  return (
    <Card className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-card h-full">
      <Link to={linkTo} className="block h-full" aria-label={title}>
        <div className="relative aspect-[2/3] bg-muted flex items-center justify-center overflow-hidden h-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Film className="h-12 w-12" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h3 className="font-bold text-sm line-clamp-2">{title}</h3>
            <div className="flex items-center justify-between text-xs text-gray-300 mt-1">
              <span>{year}</span>
              {rating !== null && rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {progress !== undefined && progress > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-primary pointer-events-none z-10"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      )}
      
      <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-2">
        {isAvailable && (
          <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent">
            <Check className="h-3 w-3 mr-1" />
            {t('available')}
          </Badge>
        )}
        {item.isRequested && !isAvailable && (
          <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white border-transparent">
            <Hourglass className="h-3 w-3 mr-1" />
            {t('requested')}
          </Badge>
        )}
        
        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {showRequestButton && !isAvailable && !item.isRequested && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onRequest) onRequest(item);
              }}
              aria-label={`${t('request')} ${title}`}
              className="h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center transition-colors duration-150 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}

          {session && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  isInFavorites(item.id, item.media_type) ? removeFromFavorites(item.id, item.media_type) : addToFavorites(item.id, item.media_type);
                }}
                aria-label={isInFavorites(item.id, item.media_type) ? t('remove_from_favorites') : t('add_to_favorites')}
                className="h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Heart className={`h-4 w-4 ${isInFavorites(item.id, item.media_type) ? 'text-red-500 fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  isInWatchlist(item.id, item.media_type) ? removeFromWatchlist(item.id, item.media_type) : addToWatchlist(item.id, item.media_type);
                }}
                aria-label={isInWatchlist(item.id, item.media_type) ? t('remove_from_watchlist') : t('add_to_watchlist')}
                className="h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Bookmark className={`h-4 w-4 ${isInWatchlist(item.id, item.media_type) ? 'text-blue-500 fill-current' : ''}`} />
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MediaCard;