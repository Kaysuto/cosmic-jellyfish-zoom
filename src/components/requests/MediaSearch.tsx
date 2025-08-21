import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Tv, Film, Loader2, Check } from 'lucide-react';

interface MediaResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
}

interface MediaSearchProps {
  onRequestMade: () => void;
}

const MediaSearch = ({ onRequestMade }: MediaSearchProps) => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [results, setResults] = useState<MediaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [requestingId, setRequestingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRequested = async () => {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from('media_requests')
        .select('media_type, tmdb_id')
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error('Error fetching requested media:', error);
      } else {
        const ids = new Set(data.map(item => `${item.media_type}-${item.tmdb_id}`));
        setRequestedIds(ids);
      }
    };
    fetchRequested();
  }, [session]);

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
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

  const handleRequest = async (media: MediaResult) => {
    if (!session?.user) {
      showError("You must be logged in to make a request.");
      return;
    }
    setRequestingId(media.id);
    try {
      const { error } = await supabase.from('media_requests').insert({
        user_id: session.user.id,
        media_type: mediaType,
        tmdb_id: media.id,
        title: media.title || media.name || 'Unknown Title',
        poster_path: media.poster_path,
        overview: media.overview,
        release_date: media.release_date || media.first_air_date,
      });

      if (error) {
        if (error.code === '23505') { // unique constraint violation
          showError(t('already_requested'));
        } else {
          throw error;
        }
      } else {
        showSuccess(t('request_successful'));
        setRequestedIds(prev => new Set(prev).add(`${mediaType}-${media.id}`));
        onRequestMade();
      }
    } catch (error: any) {
      showError(`${t('error_sending_request')}: ${error.message}`);
    } finally {
      setRequestingId(null);
    }
  };

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
      
      <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as any)}>
        <TabsList>
          <TabsTrigger value="movie"><Film className="mr-2 h-4 w-4" />{t('movie')}</TabsTrigger>
          <TabsTrigger value="tv"><Tv className="mr-2 h-4 w-4" />{t('tv_show')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[350px] w-full" />)}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {results.map(media => {
            const isRequested = requestedIds.has(`${mediaType}-${media.id}`);
            const isRequesting = requestingId === media.id;
            return (
              <Card key={media.id} className="overflow-hidden flex flex-col">
                <div className="aspect-[2/3] bg-muted">
                  {media.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w500${media.poster_path}`} alt={media.title || media.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Film className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3 flex-grow">
                  <h3 className="font-semibold line-clamp-2">{media.title || media.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(media.release_date || media.first_air_date || '').getFullYear() || ''}
                  </p>
                </CardContent>
                <CardFooter className="p-3">
                  <Button 
                    className="w-full" 
                    onClick={() => handleRequest(media)} 
                    disabled={isRequested || isRequesting}
                  >
                    {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isRequested ? <Check className="mr-2 h-4 w-4" /> : null}
                    {isRequested ? t('requested') : t('request')}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <p className="text-center text-muted-foreground py-8">{t('no_results_found')}</p>
      )}
    </div>
  );
};

export default MediaSearch;