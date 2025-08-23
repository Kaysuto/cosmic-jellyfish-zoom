import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import VideoPlayer from '@/components/media/VideoPlayer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PlayerPage = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const season = searchParams.get('season');
  const episode = searchParams.get('episode');
  const isEpisodePlayback = type !== 'movie' && season && episode;

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [mediaTitle, setMediaTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        let streamData;
        let functionError;

        if (isEpisodePlayback) {
          const result = await supabase.functions.invoke('get-jellyfin-episode-stream-url', {
            body: { 
              seriesTmdbId: Number(id), 
              seasonNumber: Number(season), 
              episodeNumber: Number(episode) 
            },
          });
          streamData = result.data;
          functionError = result.error;
          if (!functionError) setMediaTitle(streamData.title);
        } else {
          // Movie logic
          const { data: catalogItem, error: catalogError } = await supabase
            .from('catalog_items')
            .select('jellyfin_id, title')
            .eq('tmdb_id', Number(id))
            .eq('media_type', 'movie')
            .single();

          if (catalogError || !catalogItem || !catalogItem.jellyfin_id) {
            throw new Error("Ce film n'a pas été trouvé dans votre catalogue Jellyfin.");
          }
          
          const result = await supabase.functions.invoke('get-jellyfin-stream-url', {
            body: { itemId: catalogItem.jellyfin_id },
          });
          streamData = result.data;
          functionError = result.error;
          if (!functionError) setMediaTitle(catalogItem.title);
        }

        if (functionError) throw functionError;
        if (streamData.error) throw new Error(streamData.error);

        setStreamUrl(streamData.streamUrl);

      } catch (err: any) {
        console.error("Error fetching stream URL:", err);
        const baseMessage = "Une erreur est survenue lors du chargement de la vidéo.";
        const details = err.message || "";
        setError(`${baseMessage} Détails: ${details}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamUrl();
  }, [id, type, season, episode, isEpisodePlayback]);

  return (
    <div className="bg-black h-screen w-screen flex flex-col">
      <header className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/10 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Button>
        <h1 className="text-lg font-semibold text-white truncate">{mediaTitle}</h1>
      </header>
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
        {streamUrl && !loading && <VideoPlayer src={streamUrl} title={mediaTitle} />}
      </main>
    </div>
  );
};

export default PlayerPage;