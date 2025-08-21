import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/media/VideoPlayer';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { showError } from '@/utils/toast';

const PlayerPage = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStream = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // D'abord, on récupère l'ID Jellyfin et le titre depuis notre base de données
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('jellyfin_id, title')
          .eq('tmdb_id', id)
          .eq('available', true)
          .single();

        if (mediaError || !mediaData || !mediaData.jellyfin_id) {
          throw new Error('Média non trouvé ou non disponible pour le streaming.');
        }
        
        setTitle(mediaData.title || 'Video');

        // Ensuite, on récupère l'URL de streaming depuis la fonction Edge
        const { data: streamData, error: streamError } = await supabase.functions.invoke('media-sync', {
          body: { _path: '/stream-url', jellyfinId: mediaData.jellyfin_id }
        });

        if (streamError) throw streamError;

        setStreamUrl(streamData.url);
      } catch (err: any) {
        showError(err.message || 'Échec du chargement du flux vidéo.');
        navigate(`/media/${type}/${id}`); // Retour en cas d'échec
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [id, type, navigate]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[100]">
      {loading ? (
        <Loader2 className="h-16 w-16 text-white animate-spin" />
      ) : streamUrl ? (
        <VideoPlayer src={streamUrl} title={title} />
      ) : null}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 text-white bg-black/30 hover:bg-black/60 hover:text-white rounded-full h-12 w-12"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default PlayerPage;