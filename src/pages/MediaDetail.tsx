import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Check, Clock, Film, Loader2, Star, Tv } from 'lucide-react';

interface MediaDetails {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  number_of_seasons?: number;
  runtime?: number;
  episode_run_time?: number[];
}

const MediaDetailPage = () => {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRequested, setIsRequested] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!type || !id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-media-details', {
          body: { mediaType: type, mediaId: id, language: i18n.language },
        });
        if (error) throw error;
        setDetails(data);
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const checkRequestStatus = async () => {
      if (!session?.user || !type || !id) return;
      const { data, error } = await supabase
        .from('media_requests')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('media_type', type)
        .eq('tmdb_id', id)
        .single();
      
      if (data) {
        setIsRequested(true);
      }
    };

    fetchDetails();
    checkRequestStatus();
  }, [type, id, i18n.language, session]);

  const handleRequest = async () => {
    if (!session?.user || !details || !type) {
      showError("You must be logged in to make a request.");
      return;
    }
    setIsRequesting(true);
    try {
      const { error } = await supabase.from('media_requests').insert({
        user_id: session.user.id,
        media_type: type,
        tmdb_id: details.id,
        title: details.title || details.name || 'Unknown Title',
        poster_path: details.poster_path,
        overview: details.overview,
        release_date: details.release_date || details.first_air_date,
      });

      if (error) throw error;
      
      showSuccess(t('request_successful'));
      setIsRequested(true);
    } catch (error: any) {
      showError(`${t('error_sending_request')}: ${error.message}`);
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8"><Skeleton className="h-[80vh] w-full" /></div>;
  }

  if (!details) {
    return <div className="container mx-auto px-4 py-8 text-center">{t('no_results_found')}</div>;
  }

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const runtime = type === 'movie' ? details.runtime : details.episode_run_time?.[0];

  return (
    <div className="relative -mt-16">
      <div className="absolute inset-0 h-[60vh] overflow-hidden">
        <img
          src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
          alt=""
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>
      <div className="relative container mx-auto px-4 pt-[40vh] pb-16">
        <Button variant="outline" onClick={() => navigate(-1)} className="absolute top-20 left-4 z-10 bg-background/50">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <div className="md:flex gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4 -mt-24 flex-shrink-0">
            <img
              src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
              alt={title}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>
          <div className="mt-8 md:mt-0">
            <h1 className="text-4xl font-bold">{title}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              {releaseDate && (
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(releaseDate).getFullYear()}</span>
              )}
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400" /> {details.vote_average.toFixed(1)} / 10</span>
              {runtime && (
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {runtime} min</span>
              )}
              {type === 'tv' && details.number_of_seasons && (
                <span className="flex items-center gap-1.5"><Tv className="h-4 w-4" /> {details.number_of_seasons} {t('seasons', { count: details.number_of_seasons })}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {details.genres.map(genre => <Badge key={genre.id} variant="secondary">{genre.name}</Badge>)}
            </div>
            <p className="mt-6 text-lg text-muted-foreground">{details.overview}</p>
            <div className="mt-8">
              <Button size="lg" onClick={handleRequest} disabled={isRequested || isRequesting}>
                {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isRequested ? <Check className="mr-2 h-4 w-4" /> : <Film className="mr-2 h-4 w-4" />}
                {isRequested ? t('requested') : t('request')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetailPage;