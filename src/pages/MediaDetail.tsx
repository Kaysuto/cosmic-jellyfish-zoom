import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Check, Clock, Film, Loader2, Star, Tv, Play } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  seasons?: { id: number; name: string; season_number: number }[];
  number_of_seasons?: number;
  runtime?: number;
  episode_run_time?: number[];
}

interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  still_path: string;
  vote_average: number;
  air_date: string;
}

interface SeasonDetails {
  episodes: Episode[];
}

type RequestStatus = 'available' | 'pending' | 'approved' | 'rejected' | null;

const MediaDetailPage = () => {
  const { type, id } = useParams<{ type: 'movie' | 'tv' | 'anime'; id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<SeasonDetails | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number | null>(null);

  const fetchSeasonDetails = async (seasonNumber: number) => {
    if (!type || !id) return;
    setSeasonLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-tv-season-details', {
        body: { seriesId: id, seasonNumber, language: i18n.language },
      });
      if (error) throw error;
      setSelectedSeason(data);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setSeasonLoading(false);
    }
  };

  useEffect(() => {
    const fetchDetailsAndStatus = async () => {
      if (!type || !id) return;
      setLoading(true);
      try {
        const apiMediaType = type === 'anime' ? 'tv' : type;
        
        const detailsPromise = supabase.functions.invoke('get-media-details', {
          body: { mediaType: apiMediaType, mediaId: id, language: i18n.language },
        });

        const statusPromise = session?.user ? supabase
          .from('media_requests')
          .select('status')
          .eq('tmdb_id', id)
          .eq('media_type', type)
          .maybeSingle() : Promise.resolve({ data: null });

        const [detailsResult, statusResult] = await Promise.all([detailsPromise, statusPromise]);

        if (detailsResult.error) throw detailsResult.error;
        setDetails(detailsResult.data);

        if (statusResult.data) {
          setRequestStatus(statusResult.data.status as RequestStatus);
        }

        if (apiMediaType === 'tv' && detailsResult.data.seasons && detailsResult.data.seasons.length > 0) {
          const initialSeason = detailsResult.data.seasons.find((s: any) => s.season_number > 0) || detailsResult.data.seasons[0];
          setSelectedSeasonNumber(initialSeason.season_number);
        }
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailsAndStatus();
  }, [type, id, i18n.language, session]);

  useEffect(() => {
    if (type === 'tv' || type === 'anime') {
      if (selectedSeasonNumber !== null) {
        fetchSeasonDetails(selectedSeasonNumber);
      }
    }
  }, [selectedSeasonNumber, type, id, i18n.language]);

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
      setRequestStatus('pending');
    } catch (error: any) {
      showError(`${t('error_sending_request')}: ${error.message}`);
    } finally {
      setIsRequesting(false);
    }
  };

  const renderActionButton = () => {
    if (requestStatus === 'available') {
      return (
        <Button size="lg" className="bg-green-600 hover:bg-green-700">
          <Play className="mr-2 h-4 w-4" /> {t('play')}
        </Button>
      );
    }
    if (requestStatus) {
      return (
        <Button size="lg" disabled>
          <Check className="mr-2 h-4 w-4" /> {t('requested')}
        </Button>
      );
    }
    return (
      <Button size="lg" onClick={handleRequest} disabled={isRequesting}>
        {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
        {t('request')}
      </Button>
    );
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
  const apiMediaType = type === 'anime' ? 'tv' : type;

  return (
    <div className="relative -mt-16">
      <div className="absolute inset-0 h-[60vh] overflow-hidden">
        <img src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`} alt="" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>
      <div className="relative container mx-auto px-4 pt-[40vh] pb-16">
        <Button variant="outline" onClick={() => navigate(-1)} className="absolute top-20 left-4 z-10 bg-background/50">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
        </Button>
        <div className="md:flex gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4 -mt-24 flex-shrink-0">
            <img src={`https://image.tmdb.org/t/p/w500${details.poster_path}`} alt={title} className="w-full rounded-lg shadow-2xl" />
          </div>
          <div className="mt-8 md:mt-0 flex-grow">
            <h1 className="text-4xl font-bold">{title}</h1>
            <div className="flex items-center flex-wrap gap-4 mt-2 text-muted-foreground">
              {releaseDate && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(releaseDate).getFullYear()}</span>}
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400" /> {details.vote_average.toFixed(1)} / 10</span>
              {runtime && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {runtime} min</span>}
              {apiMediaType === 'tv' && details.number_of_seasons && <span className="flex items-center gap-1.5"><Tv className="h-4 w-4" /> {details.number_of_seasons} {t('seasons', { count: details.number_of_seasons })}</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {details.genres.map(genre => <Badge key={genre.id} variant="secondary">{genre.name}</Badge>)}
            </div>
            <p className="mt-6 text-lg text-muted-foreground">{details.overview}</p>
            <div className="mt-8">
              {renderActionButton()}
            </div>
          </div>
        </div>

        {apiMediaType === 'tv' && details.seasons && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-3xl font-bold">{t('seasons', { count: 2})}</h2>
              <Select value={selectedSeasonNumber?.toString()} onValueChange={(value) => setSelectedSeasonNumber(Number(value))}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a season" />
                </SelectTrigger>
                <SelectContent>
                  {details.seasons.map(season => <SelectItem key={season.id} value={season.season_number.toString()}>{season.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {seasonLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-6 p-4">
                    <Skeleton className="h-28 w-1/3 md:w-1/4 rounded-md" />
                    <div className="flex-grow space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedSeason && (
              <div className="space-y-4">
                {selectedSeason.episodes.map(episode => (
                  <div key={episode.id} className="flex flex-col md:flex-row gap-6 p-4 bg-muted/20 rounded-lg border border-border">
                    <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                      {episode.still_path ? (
                        <img src={`https://image.tmdb.org/t/p/w300${episode.still_path}`} alt={`Still from ${episode.name}`} className="rounded-md w-full" />
                      ) : (
                        <div className="w-full aspect-video flex items-center justify-center bg-muted text-muted-foreground rounded-md">
                          <Tv className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold mb-2">
                        {episode.episode_number}. {episode.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        {episode.air_date && <span>{new Date(episode.air_date).toLocaleDateString(i18n.language)}</span>}
                        <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400" /> {episode.vote_average > 0 ? `${episode.vote_average.toFixed(1)} / 10` : 'N/A'}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">{episode.overview || "No description available."}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaDetailPage;