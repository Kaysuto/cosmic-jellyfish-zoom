import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';

import { MediaPlayer, MediaOutlet, MediaCommunitySkin } from '@vidstack/react';
import type { MediaCanPlayEvent, MediaErrorEvent } from 'vidstack';

interface VideoPlayerProps {
  src: string;
  title: string;
}

const VideoPlayer = ({ src, title }: VideoPlayerProps) => {
  if (!src) return null;

  function onCanPlay(event: MediaCanPlayEvent) {
    console.log('Vidstack: Média prêt à être lu. Event:', event);
  }

  function onError(event: MediaErrorEvent) {
    console.error('Vidstack: Erreur du lecteur. Event:', event);
    alert(`Erreur du lecteur vidéo. Vérifiez la console (F12) pour les détails techniques. Cela peut être dû à un problème de CORS sur votre serveur Jellyfin.`);
  }

  return (
    <MediaPlayer
      className="w-full h-full"
      title={title}
      src={src}
      playsInline
      onCanPlay={onCanPlay}
      onError={onError}
    >
      <MediaOutlet />
      <MediaCommunitySkin />
    </MediaPlayer>
  );
};

export default VideoPlayer;