import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Film, Eye, Star, Plus } from 'lucide-react';
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
              <div className="relative">
                <Link to={`/media/${item.media_type}/${item.id}`} className="block">
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
              </div>

              <CardContent className="p-3 flex flex-col gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">{title}</h3>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span>{year}</span>
                    <span className="uppercase tracking-wider text-[10px]">{t(item.media_type)}</span>
                  </div>
                </div>

                <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="w-full justify-center">
                    <Link to={`/media/${item.media_type}/${item.id}`} aria-label={`${t('view_details')} ${title}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">{t('view_details')}</span>
                      <span className="sm:hidden">Voir</span>
                    </Link>
                  </Button>

                  {showRequestButton ? (
                    <Button asChild className="w-full justify-center">
                      <Link to={`/media/${item.media_type}/${item.id}?action=request`} aria-label={`${t('request')} ${title}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">{t('request')}</span>
                        <span className="sm:hidden">Demander</span>
                      </Link>
                    </Button>
                  ) : (
                    <div />
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