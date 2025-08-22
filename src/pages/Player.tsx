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
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('direct_stream_url, title')
          .eq('tmdb_id', id)
          .eq('available', true)
          .single();

        if (mediaError) {
          throw new Error('Média non trouvé dans la base de données.');
        }
        
        if (!mediaData.direct_stream_url) {
          throw new Error('Ce média n\'est pas disponible en streaming pour le moment (URL de lecture manquante). Veuillez lancer une synchronisation complète.');
        }

        setTitle(mediaData.title || 'Video');
        setStreamUrl(mediaData.direct_stream_url);

      } catch (err: any) {
        showError(err.message);
        navigate(`/media/${type}/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [id, type, navigate]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 text-white bg-black/30 hover:bg-black/60 hover:text-white rounded-full h-12 w-12 z-20"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <div className="w-full h-full flex items-center justify-center">
        {loading && <Loader2 className="h-16 w-16 text-white animate-spin" />}
        {!loading && !streamUrl && (
          <div className="text-white text-center">
            <p className="text-lg">Impossible de charger la vidéo.</p>
            <p className="text-sm text-muted-foreground">Veuillez vérifier la configuration de votre serveur Jellyfin.</p>
          </div>
        )}
        {streamUrl && <VideoPlayer src={streamUrl} title={title} />}
      </div>
    </div>
  );
};

export default PlayerPage;