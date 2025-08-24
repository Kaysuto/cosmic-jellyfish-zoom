import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';

import { MediaPlayer, MediaOutlet, MediaCommunitySkin } from '@vidstack/react';
import type { 
  MediaPlayerElement,
  MediaCanPlayEvent, 
  MediaErrorEvent, 
  MediaTimeUpdateEvent,
  MediaDurationChangeEvent,
  MediaLoadedMetadataEvent
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
    const detail = (event as any).detail;
    console.log('Vidstack: Media can play.', detail);
    if (player.current && startTime && (player.current as any).currentTime === 0) {
      (player.current as any).currentTime = startTime;
    }
  }

  function onError(event: MediaErrorEvent) {
    const detail = (event as any).detail;
    console.error('Vidstack: Player error.', detail);
    showError(`Video player error. Check Jellyfin CORS settings. Details: ${detail.message}`);
  }

  function onTimeUpdateEvent(event: MediaTimeUpdateEvent) {
    const { currentTime } = (event as any).detail;
    if (onTimeUpdate) {
      onTimeUpdate(currentTime);
    }
  }

  function onDurationChangeEvent(event: MediaDurationChangeEvent) {
    const { duration } = (event as any).detail;
    if (onDurationChange && !isNaN(duration) && duration > 0) {
      onDurationChange(duration);
    }
  }

  function onLoadedMetadata(event: MediaLoadedMetadataEvent) {
    const detail = (event as any).detail;
    console.log('Vidstack: Metadata loaded.', detail);
  }

  return (
    <MediaPlayer
      key={src} // Force re-mount when src changes
      ref={player}
      className="w-full max-h-screen"
      title={title}
      src={{ src: src, type: 'application/x-mpegurl' }}
      playsInline
      autoPlay
      load="eager"
      crossOrigin
      onCanPlay={onCanPlay}
      onError={onError}
      onTimeUpdate={onTimeUpdateEvent}
      onDurationChange={onDurationChangeEvent}
      onLoadedMetadata={onLoadedMetadata}
      aspectRatio={16 / 9} // Corrected to be a number
    >
      <MediaOutlet />
      <MediaCommunitySkin />
    </MediaPlayer>
  );
};

export default VideoPlayer;