import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import VideoPlayer from '@/components/media/VideoPlayer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSession } from '@/contexts/AuthContext';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { useJellyfin } from '@/contexts/JellyfinContext';

const PlayerPage = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session } = useSession();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [searchParams] = useSearchParams();
  const startTime = searchParams.get('t');
  const audioStreamIndex = searchParams.get('audioStreamIndex');
  const subtitleStreamIndex = searchParams.get('subtitleStreamIndex');

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [container, setContainer] = useState<string | null>(null);
  const [chapters, setChapters] = useState<any[] | null>(null);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [mediaTitle, setMediaTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  
  const currentTimeRef = useRef(0);
  const hasSavedOnUnmount = useRef(false);

  const updateProgress = useCallback(async (time: number) => {
    if (!session?.user || !id || !type || duration === 0 || hasSavedOnUnmount.current) return;

    await supabase.from('playback_progress').upsert({
      user_id: session.user.id,
      tmdb_id: Number(id),
      media_type: type,
      progress_seconds: Math.round(time),
      total_seconds: Math.round(duration),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,tmdb_id,media_type' });
  }, [session, id, type, duration]);

  const debouncedUpdateProgress = useCallback(
    debounce(updateProgress, 5000),
    [updateProgress]
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentTimeRef.current > 0 && !hasSavedOnUnmount.current) {
        updateProgress(currentTimeRef.current);
        hasSavedOnUnmount.current = true;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Also save on component unmount
    };
  }, [updateProgress]);

  const handleTimeUpdate = (time: number) => {
    currentTimeRef.current = time;
    debouncedUpdateProgress(time);
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
  };

  useEffect(() => {
    const fetchStreamUrl = async () => {
      if (!id || !type) {
        setError("ID de média ou type manquant.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const season = searchParams.get('season');
        const episode = searchParams.get('episode');
        const apiMediaType = type === 'anime' ? 'tv' : type;

        if (apiMediaType === 'tv' && season && episode) {
          const { data: streamData, error: functionError } = await supabase.functions.invoke('get-jellyfin-episode-stream-url', {
            body: { 
              seriesTmdbId: Number(id),
              seasonNumber: Number(season),
              episodeNumber: Number(episode),
              audioStreamIndex,
              subtitleStreamIndex
            },
          });

          if (functionError) throw functionError;
          if (streamData.error) throw new Error(streamData.error);
          
          setMediaTitle(streamData.title || `S${season} E${episode}`);
          setStreamUrl(streamData.streamUrl);
          setContainer(streamData.container);
          setChapters(streamData.chapters);
          setAudioTracks(streamData.audioTracks || []);
          setSubtitleTracks(streamData.subtitleTracks || []);
        } else {
          const { data: catalogItem, error: catalogError } = await supabase
            .from('catalog_items')
            .select('jellyfin_id, title')
            .eq('tmdb_id', Number(id))
            .eq('media_type', apiMediaType)
            .single();

          if (catalogError || !catalogItem || !catalogItem.jellyfin_id) {
            throw new Error("Ce média n'a pas été trouvé dans votre catalogue Jellyfin.");
          }
          
          setMediaTitle(catalogItem.title);

          const { data: streamData, error: functionError } = await supabase.functions.invoke('get-jellyfin-stream-url', {
            body: { 
              itemId: catalogItem.jellyfin_id,
              audioStreamIndex,
              subtitleStreamIndex
            },
          });

          if (functionError) throw functionError;
          if (streamData.error) throw new Error(streamData.error);

          setStreamUrl(streamData.streamUrl);
          setContainer(streamData.container);
          setChapters(streamData.chapters);
          setAudioTracks(streamData.audioTracks || []);
          setSubtitleTracks(streamData.subtitleTracks || []);
        }
      } catch (err: any) {
        console.error("Error fetching stream URL:", err);
        const baseMessage = "Une erreur est survenue lors du chargement de la vidéo.";
        let details = err.message || "";
        if (err instanceof FunctionsHttpError) {
          try {
            const errorJson = await err.context.json();
            if (errorJson.error) {
              details = errorJson.error;
            }
          } catch (e) {
            // Ignore if context is not valid JSON
          }
        }
        setError(`${baseMessage} Détails: ${details}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamUrl();
  }, [id, type, searchParams, audioStreamIndex, subtitleStreamIndex]);

  if (jellyfinError) {
    return (
      <div className="bg-black h-screen w-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center">
          <div className="container mx-auto px-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur de configuration Jellyfin</AlertTitle>
              <AlertDescription>{jellyfinError}</AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-black h-screen w-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center">
        {loading && <Skeleton className="w-full h-full" />}
        {error && !loading && (
          <div className="container mx-auto px-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        {streamUrl && !loading && (
          <VideoPlayer 
            src={streamUrl} 
            container={container}
            title={mediaTitle} 
            chapters={chapters}
            audioTracks={audioTracks}
            subtitleTracks={subtitleTracks}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            startTime={startTime ? Number(startTime) : null}
          />
        )}
      </main>
    </div>
  );
};

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export default PlayerPage;