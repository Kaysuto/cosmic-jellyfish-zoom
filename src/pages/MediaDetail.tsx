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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

const MediaDetailPage = () => {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRequested, setIsRequested] = useState(false);
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
    const fetchDetails = async () => {
      if (!type || !id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-media-details', {
          body: { mediaType: type, mediaId: id, language: i18n.language },
        });
        if (error) throw error;
        setDetails(data);
        if (type === 'tv' && data.seasons && data.seasons.length > 0) {
          const initialSeason = data.seasons.find((s: any) => s.season_number > 0) || data.seasons[0];
          setSelectedSeasonNumber(initialSeason.season_number);
        }
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const checkRequestStatus = async () => {
      if (!session?.user || !type || !id) return;
      const { data } = await supabase
        .from('media_requests')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('media_type', type)
        .eq('tmdb_id', id)
        .single();
      if (data) setIsRequested(true);
    };

    fetchDetails();
    checkRequestStatus();
  }, [type, id, i18n.language, session]);

  useEffect(() => {
    if (type === 'tv' && selectedSeasonNumber !== null) {
      fetchSeasonDetails(selectedSeasonNumber);
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
              {type === 'tv' && details.number_of_seasons && <span className="flex items-center gap-1.5"><Tv className="h-4 w-4" /> {details.number_of_seasons} {t('seasons', { count: details.number_of_seasons })}</span>}
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

        {type === 'tv' && details.seasons && (
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
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : selectedSeason && (
              <Accordion type="single" collapsible className="w-full">
                {selectedSeason.episodes.map(episode => (
                  <AccordionItem value={`episode-${episode.id}`} key={episode.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-4 text-left">
                        <span className="text-muted-foreground font-mono text-sm">{episode.episode_number.toString().padStart(2, '0')}</span>
                        <span className="font-semibold">{episode.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                          <img src={episode.still_path ? `https://image.tmdb.org/t/p/w300${episode.still_path}` : '/placeholder.svg'} alt={`Still from ${episode.name}`} className="rounded-md w-full" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            {episode.air_date && <span>{new Date(episode.air_date).toLocaleDateString(i18n.language)}</span>}
                            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400" /> {episode.vote_average.toFixed(1)} / 10</span>
                          </div>
                          <p className="text-muted-foreground">{episode.overview || "No description available."}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaDetailPage;