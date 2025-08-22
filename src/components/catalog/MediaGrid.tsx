import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Film, Eye, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv' | 'anime';
  vote_average?: number;
}

interface MediaGridProps {
  items: MediaItem[];
}

const MediaGrid = ({ items }: MediaGridProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      layout
      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {items.map((item, index) => {
        const title = item.title || item.name || 'No title';
        const releaseDate = item.release_date || item.first_air_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
        const mediaType = item.media_type;

        return (
          <motion.div
            key={`${item.id}-${mediaType}`}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="overflow-hidden flex flex-col h-full transition-transform hover:scale-105 hover:shadow-lg group">
              <Link to={`/media/${mediaType}/${item.id}`} className="block aspect-[2/3] bg-muted relative">
                {item.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Film className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <CardContent className="p-3 flex-grow flex flex-col justify-between bg-background/50">
                <div>
                  <h3 className="font-semibold line-clamp-2 text-sm text-white">{title}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{year}</span>
                    {item.vote_average !== undefined && (
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400" /> {item.vote_average.toFixed(1)}</span>
                    )}
                  </div>
                </div>
                <Button asChild size="sm" className="w-full mt-3">
                  <Link to={`/media/${mediaType}/${item.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t('view_details')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default MediaGrid;