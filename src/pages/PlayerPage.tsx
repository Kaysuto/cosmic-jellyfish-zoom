import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import VideoPlayer from '@/components/media/VideoPlayer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSession } from '@/contexts/AuthContext';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { useJellyfin } from '@/contexts/JellyfinContext';

const PlayerPage = () => {
  const { mediaType: type, tmdbId: id } = useParams<{ mediaType: string; tmdbId: string}>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { session } = useSession();
  const { error: jellyfinError } = useJellyfin();
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
  const [currentEpisode, setCurrentEpisode] = useState<{ season: number; episode: number } | null>(null);
  
  const currentTimeRef = useRef(0);
  const hasSavedOnUnmount = useRef(false);

  const updateProgress = useCallback(async (time: number) => {
    if (!session?.user || !id || !type || duration === 0) return;
    console.log(`Updating progress for ${type} ${id} at time ${time}`, { episode: currentEpisode });

    const record: any = {
      user_id: session.user.id,
      tmdb_id: Number(id),
      media_type: type,
      progress_seconds: Math.round(time),
      total_seconds: Math.round(duration),
      updated_at: new Date().toISOString(),
    };

    if (type === 'tv' || type === 'anime') {
      if (currentEpisode) {
        record.season_number = currentEpisode.season;
        record.episode_number = currentEpisode.episode;
      } else {
        // Don't save progress if we don't know the episode
        return;
      }
    }

    try {
      const { data: upsertData, error: upsertError } = await supabase.from('playback_progress').upsert(record, {
        onConflict: 'user_id,tmdb_id,media_type,season_number,episode_number',
      });

      if (upsertError) {
        console.error('Error upserting playback_progress:', upsertError);
      } else {
        // Emit an event signalling the DB has the latest progress for this media/episode.
        // Other components can listen to this to re-fetch continue-watching / next-up.
        try {
          window.dispatchEvent(new CustomEvent('playback-progress-saved', {
            detail: {
              tmdbId: Number(id),
              mediaType: type,
              season: record.season_number ?? null,
              episode: record.episode_number ?? null,
              time: record.progress_seconds
            }
          }));
          console.log('Dispatched playback-progress-saved event', { tmdbId: Number(id), mediaType: type, season: record.season_number, episode: record.episode_number });
        } catch (dispatchErr) {
          console.error('Failed to dispatch playback-progress-saved event', dispatchErr);
        }
      }
    } catch (err) {
      console.error('Exception while updating progress:', err);
    }
  }, [session, id, type, duration, currentEpisode]);

  const debouncedUpdateProgress = useCallback(
    debounce(updateProgress, 5000),
    [updateProgress]
  );
 
  useEffect(() => {
    const saveFinalProgress = () => {
      if (currentTimeRef.current > 0 && !hasSavedOnUnmount.current) {
        // Use sendBeacon for reliability on unload. It's asynchronous but designed for this purpose.
        // Note: sendBeacon sends a POST request. We need a way to handle this on the backend.
        // For now, we'll stick to a synchronous-like call on unload, accepting it might be blocked by some browsers.
        // A better solution would be a dedicated beacon endpoint.
        updateProgress(currentTimeRef.current);
        hasSavedOnUnmount.current = true;
      }
    };
 
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      saveFinalProgress();
      // Some browsers require returnValue to be set.
      // event.preventDefault(); // This is sometimes required.
      // event.returnValue = '';
    };
 
    window.addEventListener('beforeunload', handleBeforeUnload);
 
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveFinalProgress(); // Also save on component unmount
    };
  }, [updateProgress]);
 
  // Ensure we persist progress immediately when playback ends so that other components
  // (continue-watching / next-up) can re-fetch the latest DB state without racing.
  useEffect(() => {
    const handlePlaybackEnded = async () => {
      try {
        if (currentTimeRef.current > 0) {
          await updateProgress(currentTimeRef.current);
        }
      } catch (err) {
        console.error('Error saving progress on playback-ended:', err);
      }
    };
 
    window.addEventListener('playback-ended', handlePlaybackEnded);
    return () => {
      window.removeEventListener('playback-ended', handlePlaybackEnded);
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
        const seasonStr = searchParams.get('season');
        const episodeStr = searchParams.get('episode');
        const apiMediaType = type === 'anime' ? 'tv' : type;

        let seasonNumber: number | null = seasonStr ? Number(seasonStr) : null;
        let episodeNumber: number | null = episodeStr ? Number(episodeStr) : null;

        if (apiMediaType === 'tv' && (seasonNumber === null || episodeNumber === null)) {
          // TV show, but no specific episode. Find next up.
          const { data: catalogItem, error: catalogError } = await supabase
            .from('catalog_items')
            .select('jellyfin_id')
            .eq('tmdb_id', Number(id))
            .eq('media_type', apiMediaType)
            .single();

          if (catalogError || !catalogItem || !catalogItem.jellyfin_id) {
            throw new Error("Cette série n'a pas été trouvée dans votre catalogue Jellyfin.");
          }

          const { data: nextUpData, error: nextUpError } = await supabase.functions.invoke('get-jellyfin-next-up', {
            body: { seriesJellyfinId: catalogItem.jellyfin_id },
          });

          if (nextUpError) throw nextUpError;
          if (!nextUpData) throw new Error("Impossible de déterminer le prochain épisode à regarder.");

          seasonNumber = nextUpData.seasonNumber;
          episodeNumber = nextUpData.episodeNumber;
        }

        if (apiMediaType === 'tv' && seasonNumber !== null && episodeNumber !== null) {
          const { data: streamData, error: functionError } = await supabase.functions.invoke('get-jellyfin-episode-stream-url', {
            body: { 
              seriesTmdbId: Number(id),
              seasonNumber: seasonNumber,
              episodeNumber: episodeNumber,
              audioStreamIndex,
              subtitleStreamIndex
            },
          });

          if (functionError) throw functionError;
          if (streamData.error) throw new Error(streamData.error);
          
          setMediaTitle(streamData.title || `S${seasonNumber} E${episodeNumber}`);
          setCurrentEpisode({ season: seasonNumber, episode: episodeNumber });
          setStreamUrl(streamData.streamUrl);
          setContainer(streamData.container);
          setChapters(streamData.chapters);
          setAudioTracks(streamData.audioTracks || []);
          setSubtitleTracks(streamData.subtitleTracks || []);
        } else { // This is for movies
          const { data: catalogItem, error: catalogError } = await supabase
            .from('catalog_items')
            .select('jellyfin_id, title')
            .eq('tmdb_id', Number(id))
            .eq('media_type', apiMediaType)
            .single();

          if (catalogError || !catalogItem || !catalogItem.jellyfin_id) {
            throw new Error("Ce média n'a pas été trouvé dans votre catalogue local. Veuillez lancer une synchronisation Jellyfin depuis le panneau d'administration.");
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
            selectedSubtitleIndex={subtitleStreamIndex}
            onBack={() => {
              const from = location.state?.from || -1;
              navigate(from, { replace: true });
            }}
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