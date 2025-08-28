import { useParams, useLocation } from 'react-router-dom';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/media/VideoPlayer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PlayerPage = () => {
  const { itemId } = useParams();
  const location = useLocation();
  const { jellyfinUrl } = useJellyfin();
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const mediaSourceId = searchParams.get('mediaSourceId');

  useEffect(() => {
    const fetchStreamUrl = async () => {
      if (!itemId || !mediaSourceId) {
        setError("ID de l'élément ou source multimédia manquant.");
        setLoading(false);
        return;
      }

      try {
        const { data, error: functionError } = await supabase.functions.invoke('jellyfin-proxy', {
          body: {
            endpoint: `Items/${itemId}/PlaybackInfo`,
            method: 'POST',
            body: {
              "UserId": "YOUR_JELLYFIN_USER_ID", // This needs to be dynamic
              "MediaSourceId": mediaSourceId,
              "MaxStreamingBitrate": 140000000
            }
          }
        });

        if (functionError) throw new Error(functionError.message);
        if (data.error) throw new Error(data.error);

        // This logic is simplified. A real implementation would need to handle different stream types.
        const directStreamUrl = `${jellyfinUrl}/Videos/${itemId}/stream?MediaSourceId=${mediaSourceId}&Static=true`;
        setStreamUrl(directStreamUrl);

      } catch (e: any) {
        console.error("Erreur lors de la récupération de l'URL de lecture :", e);
        setError(`Impossible de récupérer les informations de lecture. ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamUrl();
  }, [itemId, mediaSourceId, jellyfinUrl]);

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
          <AlertTitle>Erreur de lecture</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!streamUrl) {
    return (
       <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Aucune URL de flux n'a pu être trouvée.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <VideoPlayer src={streamUrl} />
    </div>
  );
};

export default PlayerPage;