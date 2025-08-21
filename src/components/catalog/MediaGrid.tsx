import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Film, Eye, Star, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';

interface MediaItem {
  id: string | number;
  tmdb_id?: number;
  title: string;
  name?: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv' | 'anime';
  vote_average?: number;
}

interface MediaGridProps {
  items: MediaItem[];
  viewType: 'catalog' | 'search';
}

const MediaGrid = ({ items, viewType }: MediaGridProps) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set());
  const [requestingId, setRequestingId] = useState<number | null>(null);

  useEffect(() => {
    if (viewType !== 'search' || !session?.user) return;

    const fetchRequestStatus = async () => {
      const { data, error } = await supabase
        .from('media_requests')
        .select('tmdb_id')
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error("Error fetching request statuses:", error);
      } else {
        setRequestedIds(new Set(data.map(req => req.tmdb_id)));
      }
    };
    fetchRequestStatus();
  }, [viewType, session, items]);

  const handleRequest = async (e: React.MouseEvent, media: MediaItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      showError(t("You must be logged in to make a request."));
      return;
    }
    setRequestingId(Number(media.id));
    try {
      const { error } = await supabase.from('media_requests').insert({
        user_id: session.user.id,
        media_type: media.media_type,
        tmdb_id: media.id,
        title: media.title || media.name || 'Unknown Title',
        poster_path: media.poster_path,
        release_date: media.release_date || media.first_air_date,
      });
      if (error) throw error;
      showSuccess(t('request_successful'));
      setRequestedIds(prev => new Set(prev).add(Number(media.id)));
    } catch (error: any) {
      showError(`${t('error_sending_request')}: ${error.message}`);
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <motion.div
      layout
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      {items.map((item, index) => {
        const title = item.title || item.name || 'No title';
        const releaseDate = item.release_date || item.first_air_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
        const tmdbId = viewType === 'catalog' ? item.tmdb_id : item.id;
        const mediaType = item.media_type;

        return (
          <motion.div
            key={`${viewType}-${item.id}`}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="overflow-hidden flex flex-col h-full transition-transform hover:scale-105 hover:shadow-lg group">
              <Link to={`/media/${mediaType}/${tmdbId}`} className="block aspect-[2/3] bg-muted relative">
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
                {viewType === 'catalog' ? (
                  <Button asChild size="sm" className="w-full mt-3">
                    <Link to={`/media/${mediaType}/${tmdbId}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      {t('view_details')}
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    className="w-full mt-3" 
                    size="sm"
                    onClick={(e) => handleRequest(e, item)}
                    disabled={requestedIds.has(Number(item.id)) || requestingId === Number(item.id)}
                  >
                    {requestingId === Number(item.id) 
                      ? <Loader2 className="h-4 w-4 animate-spin" /> 
                      : requestedIds.has(Number(item.id)) 
                        ? <><Check className="mr-2 h-4 w-4" />{t('requested')}</> 
                        : t('request')}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default MediaGrid;