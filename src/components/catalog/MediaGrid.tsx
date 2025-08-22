import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Film, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface MediaItem {
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
}

const MediaGrid = ({ items, showRequestButton = true }: MediaGridProps) => {
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
            <Card className="group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow bg-gradient-to-br from-card to-popover">
              <Link to={`/media/${item.media_type}/${item.id}`} className="block relative">
                <div className="aspect-[2/3] bg-muted flex items-center justify-center overflow-hidden">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Film className="h-12 w-12" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Top-right badge */}
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

              <CardContent className="p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">{title}</h3>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{year}</span>
                      <span className="uppercase tracking-wider text-[10px]">{t(item.media_type)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Link to={`/media/${item.media_type}/${item.id}`} className="flex-grow">
                    <Button size="sm" className="w-full justify-center" variant="ghost">
                      <Eye className="mr-2 h-4 w-4" />
                      {t('view_details')}
                    </Button>
                  </Link>

                  {showRequestButton && (
                    <button
                      aria-label="request"
                      className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
                      onClick={(e) => {
                        // Prevent Link navigation if inside a Link
                        e.stopPropagation();
                        // fallback: link to details where request action exists
                        // (actual request handling is on the detail page)
                        // We rely on the Link above for navigation.
                      }}
                    >
                      <span className="sr-only">{t('request')}</span>
                      {t('request')}
                    </button>
                  )}
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