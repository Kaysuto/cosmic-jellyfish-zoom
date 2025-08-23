import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';

import { MediaPlayer, MediaOutlet, MediaCommunitySkin } from '@vidstack/react';
import type { 
  MediaPlayerElement,
  MediaCanPlayEvent, 
  MediaErrorEvent, 
  MediaTimeUpdateEvent,
  MediaDurationChangeEvent
} from 'vidstack';
import { showError } from '@/utils/toast';
import { useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  title: string;
  startTime?: number | null;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
}

const VideoPlayer = ({ src, title, startTime, onTimeUpdate, onDurationChange }: VideoPlayerProps) => {
  const player = useRef<MediaPlayerElement>(null);
  
  if (!src) return null;

  function onCanPlay(event: MediaCanPlayEvent) {
    console.log('Vidstack: Média prêt à être lu. Event:', event);
    if (player.current && startTime && (player.current as any).currentTime === 0) {
      (player.current as any).currentTime = startTime;
    }
  }

  function onError(event: MediaErrorEvent) {
    console.error('Vidstack: Erreur du lecteur. Event:', event);
    showError(`Erreur du lecteur vidéo. Vérifiez que CORS est bien configuré sur votre serveur Jellyfin.`);
  }

  function onTimeUpdateEvent(event: MediaTimeUpdateEvent) {
    const detail = (event as any).detail;
    const time = detail.currentTime;
    if (onTimeUpdate) {
      onTimeUpdate(time);
    }
  }

  function onDurationChangeEvent(event: MediaDurationChangeEvent) {
    const duration = (event as any).detail;
    if (onDurationChange && !isNaN(duration) && duration > 0) {
      onDurationChange(duration);
    }
  }

  return (
    <MediaPlayer
      ref={player}
      className="w-full max-h-screen"
      title={title}
      src={src}
      playsInline
      autoPlay
      onCanPlay={onCanPlay}
      onError={onError}
      onTimeUpdate={onTimeUpdateEvent}
      onDurationChange={onDurationChangeEvent}
      aspectRatio="16/9"
    >
      <MediaOutlet />
      <MediaCommunitySkin />
    </MediaPlayer>
  );
};

export default VideoPlayer;