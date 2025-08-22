import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Film, Star, Info, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv' | 'anime';
  vote_average?: number;
}

interface MediaGridProps {
  items: MediaItem[];
  onRequest?: (item: MediaItem) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ items, onRequest }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      layout
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      {items.map((item, index) => {
        const title = item.title || item.name || 'No title';
        const releaseDate = item.release_date || item.first_air_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
        const rating = item.vote_average ?? null;

        return (
          <motion.div
            key={`${item.id}-${item.media_type}`}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, delay: index * 0.02 }}
          >
            <Card className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow bg-card">
              <Link to={`/media/${item.media_type}/${item.id}`} className="block" aria-label={title}>
                <div className="aspect-[2/3] bg-muted flex items-center justify-center overflow-hidden">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Film className="h-12 w-12" />
                    </div>
                  )}

                  {/* Overlay for text and actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="absolute top-2 right-2 z-10">
                    {rating !== null && (
                      <div className="inline-flex items-center gap-1 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-md">
                        <Star className="h-3 w-3 text-yellow-400" />
                        <span>{rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 p-3 text-white w-full">
                    <h3 className="text-sm font-semibold line-clamp-2">{title}</h3>
                    <p className="text-xs text-gray-300 mt-1">{year}</p>
                  </div>
                </div>
              </Link>
              
              {/* Hover actions */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button asChild size="icon" className="rounded-full h-10 w-10 bg-black/50 backdrop-blur-sm">
                  <Link to={`/media/${item.media_type}/${item.id}`}><Info className="h-5 w-5" /></Link>
                </Button>
                <Button size="icon" className="rounded-full h-10 w-10 bg-black/50 backdrop-blur-sm" onClick={() => onRequest && onRequest(item)}>
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default MediaGrid;