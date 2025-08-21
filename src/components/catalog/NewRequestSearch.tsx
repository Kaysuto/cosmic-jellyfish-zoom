import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Tv, Film, Loader2, Flame, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/contexts/AuthContext';

interface MediaResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  genre_ids?: number[];
  vote_average: number;
}

const NewRequestSearch = () => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState<'movie' | 'tv' | 'anime'>('movie');
  const [results, setResults] = useState<MediaResult[]>([]);
  const [featured, setFeatured] = useState<MediaResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const { session } = useSession();
  const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set());
  const [requestingId, setRequestingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-featured-media', {
          body: { language: i18n.language },
        });
        if (error) throw error;
        setFeatured(data);
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [i18n.language]);

  useEffect(() => {
    const fetchRequestStatus = async () => {
      if (!session?.user) {
        setRequestedIds(new Set());
        return;
      }
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
  }, [session]);

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setResults([]);
    try {
      const { data, error } = await supabase.functions.invoke('search-media', {
        body: { query, mediaType, language: i18n.language },
      });
      if (error) throw error;
      setResults(data);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaTypeChange = (value: string) => {
    setMediaType(value as 'movie' | 'tv' | 'anime');
    if (hasSearched) {
      setHasSearched(false);
      setQuery('');
      setResults([]);
    }
  };

  const handleRequest = async (e: React.MouseEvent, media: MediaResult) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      showError(t("You must be logged in to make a request."));
      return;
    }
    setRequestingId(media.id);
    try {
      const { error } = await supabase.from('media_requests').insert({
        user_id: session.user.id,
        media_type: mediaType === 'anime' ? 'anime' : media.media_type,
        tmdb_id: media.id,
        title: media.title || media.name || 'Unknown Title',
        poster_path: media.poster_path,
        overview: media.overview,
        release_date: media.release_date || media.first_air_date,
      });
      if (error) throw error;
      showSuccess(t('request_successful'));
      setRequestedIds(prev => new Set(prev).add(media.id));
    } catch (error: any) {
      showError(`${t('error_sending_request')}: ${error.message}`);
    } finally {
      setRequestingId(null);
    }
  };

  const mediaToDisplay = useMemo(() => {
    if (hasSearched) {
      return results;
    }
    if (mediaType === 'anime') {
      return featured.filter(item => item.media_type === 'tv' && item.genre_ids?.includes(16));
    }
    return featured.filter(item => item.media_type === mediaType);
  }, [hasSearched, results, featured, mediaType]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_for_media')}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('search')}</Button>
      </form>
      
      <Tabs value={mediaType} onValueChange={handleMediaTypeChange}>
        <TabsList>
          <TabsTrigger value="movie"><Film className="mr-2 h-4 w-4" />{t('movie')}</TabsTrigger>
          <TabsTrigger value="tv"><Tv className="mr-2 h-4 w-4" />{t('tv_show')}</TabsTrigger>
          <TabsTrigger value="anime"><Flame className="mr-2 h-4 w-4" />{t('anime')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-[420px] w-full" />)}
        </div>
      )}

      {!loading && mediaToDisplay.length > 0 && (
        <div>
          {!hasSearched && <h2 className="text-2xl font-bold mb-4">{t('featured_media')}</h2>}
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {mediaToDisplay.map(media => (
                <motion.div
                  key={media.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden flex flex-col h-full transition-shadow hover:shadow-lg">
                    <Link to={`/media/${mediaType === 'anime' ? 'anime' : media.media_type}/${media.id}`} className="block">
                      <div className="aspect-[2/3] bg-muted">
                        {media.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w500${media.poster_path}`} alt={media.title || media.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Film className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-3 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold line-clamp-2 text-sm">{media.title || media.name}</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>{new Date(media.release_date || media.first_air_date || '').getFullYear() || ''}</span>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400" /> {media.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-3" 
                        size="sm"
                        onClick={(e) => handleRequest(e, media)}
                        disabled={requestedIds.has(media.id) || requestingId === media.id}
                      >
                        {requestingId === media.id 
                          ? <Loader2 className="h-4 w-4 animate-spin" /> 
                          : requestedIds.has(media.id) 
                            ? <><Check className="mr-2 h-4 w-4" />{t('requested')}</> 
                            : t('request')}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <p className="text-center text-muted-foreground py-8">{t('no_results_found')}</p>
      )}
    </div>
  );
};

export default NewRequestSearch;