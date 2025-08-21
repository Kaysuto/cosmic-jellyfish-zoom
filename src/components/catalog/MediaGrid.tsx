import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Film, Eye } from 'lucide-react';
import { AvailableMedia } from '@/hooks/useAvailableMedia';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';

interface MediaGridProps {
  media: AvailableMedia[];
}

const MediaGrid = ({ media }: MediaGridProps) => {
  const { t } = useTranslation();
  return (
    <motion.div
      layout
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      {media.map((item, index) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="overflow-hidden flex flex-col h-full transition-transform hover:scale-105 hover:shadow-lg group">
            <div className="aspect-[2/3] bg-muted relative">
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Film className="h-12 w-12" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <CardContent className="p-3 flex-grow flex flex-col justify-between bg-background/50">
              <div>
                <h3 className="font-semibold line-clamp-2 text-sm text-white">{item.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.release_date).getFullYear() || ''}
                </p>
              </div>
              <Button asChild size="sm" className="w-full mt-3">
                <Link to={`/media/${item.media_type}/${item.tmdb_id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('view_details')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MediaGrid;