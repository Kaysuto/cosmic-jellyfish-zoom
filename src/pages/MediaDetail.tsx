import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Check, Clock, Film, Loader2, Star, Tv, Play, User, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MediaGrid from '@/components/catalog/MediaGrid';
import { motion } from 'framer-motion';

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
  runtime?: number;
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
  const [videos, setVideos] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [credits, setCredits] = useState<{ cast: any[], crew: any[] }>({ cast: [], crew: [] });
  const [videoPage, setVideoPage] = useState(1);
  const [jellyfinId, setJellyfinId] = useState<string | null>(null);

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
    const fetchAllDetails = async () => {
      if (!type || !id) return;
      setLoading(true);
      try {
        const apiMediaType = type === 'anime' ? 'tv' : type;
        
        const detailsPromise = supabase.functions.invoke('get-media-details', { body: { mediaType: apiMediaType, mediaId: id, language: i18n.language } });
        const videosPromise = supabase.functions.invoke('get-media-videos', { body: { mediaType: apiMediaType, mediaId: id, language: i18n.language } });
        const similarPromise = supabase.functions.invoke('get-similar-media', { body: { mediaType: apiMediaType, mediaId: id, language: i18n.language } });
        const creditsPromise = supabase.functions.invoke('get-media-credits', { body: { mediaType: apiMediaType, mediaId: id, language: i18n.language } });
        
        const [detailsResult, videosResult, similarResult, creditsResult] = await Promise.all([detailsPromise, videosPromise, similarPromise, creditsPromise]);

        if (detailsResult.error) throw detailsResult.error;
        const tmdbDetails = detailsResult.data;
        setDetails(tmdbDetails);

        const { data: mediaMatch, error: mediaError } = await supabase
          .from('media')
          .select('jellyfin_id, available')
          .eq('tmdb_id', tmdbDetails.id)
          .maybeSingle();

        if (mediaError) console.error("Error checking media availability:", mediaError);
        
        if (mediaMatch?.available) {
          setRequestStatus('available');
          setJellyfinId(mediaMatch.jellyfin_id);
        } else {
          const { data: requestData } = session?.user ? await supabase.from('media_requests').select('status').eq('tmdb_id', id).eq('media_type', type).maybeSingle() : { data: null };
          if (requestData) setRequestStatus(requestData.status as RequestStatus);
        }

        if (videosResult.error) console.error('Error fetching videos:', videosResult.error); else setVideos(videosResult.data.results);
        if (similarResult.error) console.error('Error fetching similar media:', similarResult.error); else setSimilar(similarResult.data);
        if (creditsResult.error) console.error('Error fetching credits:', creditsResult.error); else setCredits(creditsResult.data);
        
        if (apiMediaType === 'tv' && tmdbDetails.seasons?.length > 0) {
          const initialSeason = tmdbDetails.seasons.find((s: any) => s.season_number > 0) || tmdbDetails.seasons[0];
          setSelectedSeasonNumber(initialSeason.season_number);
        }
      } catch (error: any) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDetails();
  }, [type, id, i18n.language, session]);

  useEffect(() => {
    if ((type === 'tv' || type === 'anime') && selectedSeasonNumber !== null) {
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
      setRequestStatus('pending');
    } catch (error: any) {
      showError(`${t('error_sending_request')}: ${error.message}`);
    } finally {
      setIsRequesting(false);
    }
  };

  const handlePlay = () => {
    showError("La lecture Jellyfin a été désactivée dans cette instance.");
  };

  const renderActionButton = () => {
    if (!session) {
      return (
        <Button size="lg" onClick={() => navigate('/login')}>
          <User className="mr-2 h-4 w-4" /> {t('login_to_request')}
        </Button>
      );
    }

    if (requestStatus === 'available') {
      return (
        <Button size="lg" disabled className="bg-gray-700 text-gray-300 cursor-not-allowed">
          <Play className="mr-2 h-4 w-4" /> {t('play')} (désactivé)
        </Button>
      );
    }
    if (requestStatus === 'pending' || requestStatus === 'approved') {
      return <Button size="lg" disabled><Check className="mr-2 h-4 w-4" /> {t('requested')}</Button>;
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
  const youtubeVideos = videos.filter(v => v.site === 'YouTube');
  const similarWithMediaType = similar.map(item => ({ ...item, media_type: type }));

  const VIDEOS_PER_PAGE = 4;
  const totalVideoPages = Math.ceil(youtubeVideos.length / VIDEOS_PER_PAGE);
  const currentVideos = youtubeVideos.slice(
    (videoPage - 1) * VIDEOS_PER_PAGE,
    videoPage * VIDEOS_PER_PAGE
  );

  return (
    <div className="relative -mt-16">
      <div className="absolute inset-0 h-[60vh] overflow-hidden">
        <img src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`} alt="" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>
      <div className="relative container mx-auto px-4 pt-[40vh] pb-16">
        <Button asChild variant="outline" className="absolute top-20 left-4 z-50 bg-background/50">
          <Link to="/catalog">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('back_to_catalog')}
          </Link>
        </Button>
        <div className="md:flex gap-8">
          <motion.div 
            className="w-full md:w-1/3 lg:w-1/4 -mt-24 flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <img src={`https://image.tmdb.org/t/p/w500${details.poster_path}`} alt={title} className="w-full rounded-lg shadow-2xl" />
          </motion.div>
          <motion.div 
            className="mt-8 md:mt-0 flex-grow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
          >
            <h1 className="text-5xl font-bold">{title}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-muted-foreground">
              {releaseDate && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(releaseDate).getFullYear()}</span>}
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400" /> {details.vote_average.toFixed(1)} / 10</span>
              {runtime && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {runtime} min</span>}
              {apiMediaType === 'tv' && details.number_of_seasons && <span className="flex items-center gap-1.5"><Tv className="h-4 w-4" /> {details.number_of_seasons} {t('seasons', { count: details.number_of_seasons })}</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {details.genres.map(genre => <Badge key={genre.id} variant="secondary">{genre.name}</Badge>)}
            </div>
            <p className="mt-6 text-lg text-muted-foreground">{details.overview}</p>
            <div className="mt-8">{renderActionButton()}</div>
          </motion.div>
        </div>

        <div className="mt-12">
          <Tabs defaultValue={apiMediaType === 'tv' ? 'episodes' : 'videos'} className="w-full">
            <TabsList>
              {apiMediaType === 'tv' && <TabsTrigger value="episodes">{t('episodes')}</TabsTrigger>}
              <TabsTrigger value="videos">{t('videos_and_trailers')}</TabsTrigger>
              <TabsTrigger value="similar">{t('similar_content')}</TabsTrigger>
              <TabsTrigger value="cast">{t('cast_and_production')}</TabsTrigger>
            </TabsList>

            {apiMediaType === 'tv' && (
              <TabsContent value="episodes" className="mt-6">
                <Alert variant="destructive" className="my-6 bg-red-900/30 border-red-500/30 text-red-300">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('tmdb_disclaimer_title')}</AlertTitle>
                  <AlertDescription>{t('tmdb_disclaimer_content')}</AlertDescription>
                </Alert>
                <div className="flex items-center gap-4 mb-6">
                  <Select value={selectedSeasonNumber?.toString()} onValueChange={(value) => setSelectedSeasonNumber(Number(value))}>
                    <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select a season" /></SelectTrigger>
                    <SelectContent>
                      {details.seasons?.map(season => <SelectItem key={season.id} value={season.season_number.toString()}>{season.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {seasonLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="aspect-video w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : selectedSeason && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {selectedSeason.episodes.map(episode => (
                      <Card key={episode.id} className="overflow-hidden transition-transform hover:scale-105">
                        <div className="aspect-video bg-muted">
                          {episode.still_path ? (
                            <img src={`https://image.tmdb.org/t/p/w500${episode.still_path}`} alt={episode.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Tv className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <p className="text-xs text-muted-foreground">Épisode {episode.episode_number}</p>
                          <h4 className="font-semibold text-sm truncate">{episode.name}</h4>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}

            <TabsContent value="videos" className="mt-6">
              {youtubeVideos.length > 0 ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentVideos.map(video => (
                      <div key={video.id}>
                        <div className="aspect-video mb-2">
                          <iframe 
                            className="w-full h-full rounded-lg" 
                            src={`https://www.youtube.com/embed/${video.key}`} 
                            title={video.name} 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen>
                          </iframe>
                        </div>
                        <h4 className="font-semibold">{video.name}</h4>
                        <p className="text-sm text-muted-foreground">{video.type}</p>
                      </div>
                    ))}
                  </div>
                  {totalVideoPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVideoPage(p => p - 1)}
                        disabled={videoPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {t('previous')}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {t('page')} {videoPage} / {totalVideoPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVideoPage(p => p + 1)}
                        disabled={videoPage === totalVideoPages}
                      >
                        {t('next')}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p>{t('no_trailer_available')}</p>
              )}
            </TabsContent>
            <TabsContent value="similar" className="mt-6">
              {similarWithMediaType.length > 0 ? <MediaGrid items={similarWithMediaType} /> : <p>{t('no_similar_content')}</p>}
            </TabsContent>
            <TabsContent value="cast" className="mt-6">
              <h3 className="text-2xl font-bold mb-4">{t('cast')}</h3>
              {credits.cast.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {credits.cast.slice(0, 18).map((person) => (
                    <Card key={person.id} className="text-center overflow-hidden bg-muted/20 border-border">
                      {person.profile_path ? <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} className="w-full h-auto object-cover aspect-[2/3]" /> : <div className="w-full aspect-[2/3] flex items-center justify-center bg-muted text-muted-foreground"><User className="h-12 w-12" /></div>}
                      <CardContent className="p-2">
                        <p className="font-bold text-sm truncate">{person.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : <p>{t('no_cast_info')}</p>}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MediaDetailPage;