import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [mediaTitle, setMediaTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMediaAndSetUrl = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get Jellyfin ID from our catalog using TMDB ID
        const { data: catalogItem, error: catalogError } = await supabase
          .from('catalog_items')
          .select('jellyfin_id, title')
          .eq('tmdb_id', id)
          .eq('media_type', type === 'anime' ? 'tv' : type)
          .single();

        if (catalogError || !catalogItem) {
          throw new Error("Ce média n'a pas été trouvé dans votre catalogue Jellyfin.");
        }

        setMediaTitle(catalogItem.title);

        // 2. Construct the URL to our new proxy function
        const proxyUrl = `https://tgffkwoekuaetahrwioo.supabase.co/functions/v1/stream-jellyfin-video?itemId=${catalogItem.jellyfin_id}`;
        setStreamUrl(proxyUrl);

      } catch (err: any) {
        console.error("Error setting up stream URL:", err);
        setError(err.message || "Une erreur est survenue lors du chargement de la vidéo.");
      } finally {
        setLoading(false);
      }
    };

    fetchMediaAndSetUrl();
  }, [id, type]);

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