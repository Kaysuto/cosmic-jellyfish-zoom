import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';

import { MediaPlayer, MediaOutlet, MediaCommunitySkin } from '@vidstack/react';
import { TextTrack } from 'vidstack';
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
  container?: string | null;
  chapters?: any[] | null;
  startTime?: number | null;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
}

const VideoPlayer = ({ src, title, container, chapters, startTime, onTimeUpdate, onDurationChange }: VideoPlayerProps) => {
  const player = useRef<MediaPlayerElement>(null);
  
  const onLoadedMetadata = (event: MediaLoadedMetadataEvent) => {
    const playerRef = player.current as any;
    if (!playerRef || !chapters || chapters.length === 0) return;

    // This logic runs once metadata is loaded, which is a safe time.
    const existingTracks = playerRef.textTracks.getByKind('chapters');
    for (const track of existingTracks) {
      playerRef.textTracks.remove(track);
    }

    const track = new TextTrack({
      kind: 'chapters',
      default: true,
      label: 'Chapters',
    });

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const nextChapter = chapters[i + 1];
      
      const startTime = chapter.StartPositionTicks / 10000000;
      const endTime = nextChapter ? (nextChapter.StartPositionTicks / 10000000) : playerRef.duration;

      if (isNaN(startTime) || isNaN(endTime) || startTime >= endTime) continue;

      const cue = new window.VTTCue(startTime, endTime, chapter.Name);
      track.addCue(cue);
    }

    playerRef.textTracks.add(track);
  };

  if (!src) return null;

  const source = {
    src: src,
    type: container ? `video/${container.toLowerCase()}` : undefined,
  };

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

  return (
    <MediaPlayer
      key={src} // Force re-mount when src changes
      ref={player}
      className="w-full max-h-screen"
      title={title}
      src={source}
      playsInline
      autoPlay
      load="eager"
      crossOrigin
      onCanPlay={onCanPlay}
      onError={onError}
      onTimeUpdate={onTimeUpdateEvent}
      onDurationChange={onDurationChangeEvent}
      onLoadedMetadata={onLoadedMetadata}
      aspectRatio={16 / 9}
    >
      <MediaOutlet />
      <MediaCommunitySkin />
    </MediaPlayer>
  );
};

export default VideoPlayer;