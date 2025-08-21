import VideoPlayer from '@/components/media/VideoPlayer';
import { Link } from 'react-router-dom';

const TestPlayer = () => {
  const testStreamUrl = 'https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqB02xavP4HE34g.m3u8';
  const testTitle = 'Public Test Stream';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Test du composant Lecteur Média</h1>
      <p className="mb-4">
        Cette page teste le composant VideoPlayer avec un flux HLS public et fonctionnel.
        Si vous pouvez voir et lire la vidéo ci-dessous, cela signifie que le composant lecteur fonctionne correctement.
        Le problème viendrait alors du flux vidéo fourni par votre serveur Jellyfin.
      </p>
      <Link to="/" className="text-blue-400 hover:underline mb-4 block">&larr; Retour à l'accueil</Link>
      <div className="w-full max-w-4xl mx-auto aspect-video">
        <VideoPlayer src={testStreamUrl} title={testTitle} />
      </div>
    </div>
  );
};

export default TestPlayer;