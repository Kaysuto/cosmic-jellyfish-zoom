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
    console.log('Vidstack: Media can play.', { detail: (event as any).detail });
  }

  function onError(event: MediaErrorEvent) {
    const error = (event as any).detail;
    console.error('Vidstack: Player Error.', { detail: error });
    alert(`Erreur du lecteur vidéo : ${error.message} (Code: ${error.code}). Vérifiez la console (F12) pour plus de détails.`);
  }

  return (
    <MediaPlayer
      className="w-full h-full"
      title={title}
      src={{ src: src, type: 'video/mp4' }}
      playsInline
      crossOrigin
      onCanPlay={onCanPlay}
      onError={onError}
    >
      <MediaOutlet />
      <MediaCommunitySkin />
    </MediaPlayer>
  );
};

export default VideoPlayer;