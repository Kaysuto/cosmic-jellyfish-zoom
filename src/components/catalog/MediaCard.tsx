import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Film, Star, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MediaItem } from './MediaGrid';
import { useJellyfin } from '@/contexts/JellyfinContext';

interface MediaCardProps {
  item: MediaItem;
  showRequestButton?: boolean;
  onRequest?: (item: MediaItem) => void;
  searchTerm?: string;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, showRequestButton = true, onRequest, searchTerm }) => {
  const { t } = useTranslation();
  const { jellyfinUrl } = useJellyfin();

  const title = item.title || item.name || 'No title';
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const rating = item.vote_average ?? null;
  
  const linkTo = searchTerm
    ? `/media/${item.media_type}/${item.id}?fromSearch=${encodeURIComponent(searchTerm)}`
    : `/media/${item.media_type}/${item.id}`;

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    // TMDB paths always start with a slash
    if (path.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    }
    // Jellyfin paths are relative, e.g., "Items/..."
    if (jellyfinUrl && path.startsWith('Items/')) {
      return `${jellyfinUrl}/${path}`;
    }
    // It might be a full URL already, or we can't construct it
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
      
      {showRequestButton && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onRequest) onRequest(item);
          }}
          aria-label={`${t('request')} ${title}`}
          className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </Card>
  );
};

export default MediaCard;