import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
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
  showRequestButton?: boolean;
  onRequest?: (item: MediaItem) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ items, showRequestButton = true, onRequest }) => {
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
            <Card className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow bg-gradient-to-br from-card to-popover flex flex-col">
              <div className="relative">
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

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent pointer-events-none" />

                    {/* Center icons: semi-transparent by default, full on hover */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 pointer-events-none">
                      <div className="flex items-center gap-3 opacity-20 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 group-hover:scale-110 transition-all duration-300">
                        {/* Info: navigates to details */}
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="bg-black/30 hover:bg-black/50 text-white rounded-full pointer-events-auto"
                          aria-label={`${t('view_details')} ${title}`}
                        >
                          <Link to={`/media/${item.media_type}/${item.id}`}>
                            <Info className="h-4 w-4" />
                          </Link>
                        </Button>

                        {/* Request: call callback (if provided) */}
                        {showRequestButton ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onRequest) onRequest(item);
                            }}
                            aria-label={`${t('request')} ${title}`}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-black/30 hover:bg-black/50 text-white pointer-events-auto focus:outline-none"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Top-right rating badge */}
                    <div className="absolute top-2 right-2 z-10">
                      {rating !== null && (
                        <div className="inline-flex items-center gap-1 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-md">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span>{rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>

              <CardContent className="p-3 flex-grow">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 h-10">{title}</h3>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span>{year}</span>
                    <span className="uppercase tracking-wider text-[10px]">{t(item.media_type)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default MediaGrid;