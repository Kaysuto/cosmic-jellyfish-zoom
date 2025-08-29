import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/media/VideoPlayer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

interface StreamData {
  streamUrl: string;
  title: string;
  container: string;
  chapters: any[];
  audioTracks: any[];
  subtitleTracks: any[];
  totalDuration?: number;
}

const PlayerPage = () => {
  const { mediaType, tmdbId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const { jellyfinUrl } = useJellyfin();
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [mediaDuration, setMediaDuration] = useState<number>(0);

  const searchParams = new URLSearchParams(location.search);
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');
  const startTime = searchParams.get('t');
  const audioStreamIndex = searchParams.get('audioStreamIndex');
  const subtitleStreamIndex = searchParams.get('subtitleStreamIndex');

  useEffect(() => {
    const fetchStreamData = async () => {
      if (!mediaType || !tmdbId) {
        setError(t('player.missing_media_info'));
        setLoading(false);
        return;
      }

      try {
        // Récupérer l'ID Jellyfin depuis le catalogue
        const { data: catalogItem, error: catalogError } = await supabase
          .from('catalog_items')
          .select('jellyfin_id, title')
          .eq('tmdb_id', Number(tmdbId))
          .eq('media_type', mediaType)
          .single();

        if (catalogError || !catalogItem?.jellyfin_id) {
          throw new Error(t('player.media_not_found_in_catalog'));
        }

        let streamResponse;
        
        if (mediaType === 'movie') {
          // Pour les films, utiliser get-jellyfin-stream-url
          streamResponse = await supabase.functions.invoke('get-jellyfin-stream-url', {
            body: {
              itemId: catalogItem.jellyfin_id,
              audioStreamIndex: audioStreamIndex || undefined,
              subtitleStreamIndex: subtitleStreamIndex || undefined
            }
          });
        } else if (mediaType === 'tv' || mediaType === 'anime') {
          // Pour les séries, utiliser get-jellyfin-episode-stream-url
          if (!season || !episode) {
            throw new Error(t('player.missing_season_episode'));
          }
          
          streamResponse = await supabase.functions.invoke('get-jellyfin-episode-stream-url', {
            body: {
              seriesTmdbId: Number(tmdbId),
              seasonNumber: Number(season),
              episodeNumber: Number(episode),
              audioStreamIndex: audioStreamIndex || undefined,
              subtitleStreamIndex: subtitleStreamIndex || undefined
            }
          });
        } else {
          throw new Error(t('player.unsupported_media_type'));
        }

        if (streamResponse.error) {
          throw new Error(streamResponse.error.message);
        }

        if (streamResponse.data.error) {
          throw new Error(streamResponse.data.error);
        }

        setStreamData(streamResponse.data);
        setTitle(streamResponse.data.title || 'Média');
        if (streamResponse.data.totalDuration) {
          setMediaDuration(streamResponse.data.totalDuration);
        }

      } catch (e: any) {
        console.error("Erreur lors de la récupération des données de streaming :", e);
        setError(e.message || t('player.stream_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchStreamData();
  }, [mediaType, tmdbId, season, episode, audioStreamIndex, subtitleStreamIndex, t]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleTimeUpdate = (time: number) => {
    // Sauvegarder la progression de lecture
    if (mediaType && tmdbId) {
      const progressData = {
        tmdbId: Number(tmdbId),
        mediaType,
        season: season ? Number(season) : null,
        episode: episode ? Number(episode) : null,
        position: time,
        totalDuration: mediaDuration || streamData?.totalDuration || 0
      };
      
      // Dispatch un événement pour sauvegarder la progression
      window.dispatchEvent(new CustomEvent('playback-progress', { 
        detail: progressData 
      }));
    }
  };

  const handleDurationChange = (duration: number) => {
    // Sauvegarder la durée totale du média
    console.log('Durée du média:', duration);
    setMediaDuration(duration);
  };

  if (loading) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>{t('player.playback_error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!streamData?.streamUrl) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>{t('player.error')}</AlertTitle>
          <AlertDescription>{t('player.no_stream_url')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <VideoPlayer 
        src={streamData.streamUrl}
        title={title}
        container={streamData.container}
        chapters={streamData.chapters}
        subtitleTracks={streamData.subtitleTracks}
        startTime={startTime ? Number(startTime) : null}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onBack={handleBack}
      />
    </div>
  );
};

export default PlayerPage;