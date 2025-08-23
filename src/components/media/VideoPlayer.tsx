import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';

import { MediaPlayer, MediaOutlet, MediaCommunitySkin } from '@vidstack/react';
import type { MediaCanPlayEvent, MediaErrorEvent } from 'vidstack';
import { showError } from '@/utils/toast';

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
    showError(`Erreur du lecteur vidéo. Vérifiez que CORS est bien configuré sur votre serveur Jellyfin.`);
  }

  return (
    <MediaPlayer
      className="w-full max-h-screen"
      title={title}
      src={src}
      playsInline
      onCanPlay={onCanPlay}
      onError={onError}
      aspectRatio="16/9"
    >
      <MediaOutlet />
      <MediaCommunitySkin />
    </MediaPlayer>
  );
};

export default VideoPlayer;