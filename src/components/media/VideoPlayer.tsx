import 'vidstack/player/styles/base.css';
import 'vidstack/player/styles/default/theme.css';
import 'vidstack/player/styles/default/layouts/video.css';

import { MediaPlayer, MediaOutlet } from '@vidstack/react';
import { VideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/video';
import { TextTrack } from 'vidstack';
import type { 
  MediaPlayerElement,
  MediaCanPlayEvent, 
  MediaErrorEvent, 
  MediaTimeUpdateEvent,
  MediaDurationChangeEvent,
  MediaLoadedMetadataEvent,
} from 'vidstack';
import { showError } from '@/utils/toast';
import { useRef } from 'react';
import {
  Play,
  Pause,
  VolumeX,
  Volume1,
  Volume2,
  Subtitles,
  ListOrdered,
  Settings,
  Cast,
  PictureInPicture,
  Maximize,
  Minimize,
  ArrowLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

const customIcons = {
  ...defaultLayoutIcons,
  Play: Play,
  Pause: Pause,
  Mute: VolumeX,
  VolumeLow: Volume1,
  VolumeHigh: Volume2,
  Captions: Subtitles,
  Chapters: ListOrdered,
  Settings: Settings,
  GoogleCast: Cast,
  Pip: PictureInPicture,
  EnterFullscreen: Maximize,
  ExitFullscreen: Minimize,
  MenuArrowLeft: ArrowLeft,
  MenuArrowRight: ChevronRight,
  MenuCheck: Check,
};

interface VideoPlayerProps {
  src: string;
  title: string;
  container?: string | null;
  chapters?: any[] | null;
  audioTracks?: any[];
  subtitleTracks?: any[];
  startTime?: number | null;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
}

const VideoPlayer = ({ src, title, container, chapters, subtitleTracks, startTime, onTimeUpdate, onDurationChange }: VideoPlayerProps) => {
  const player = useRef<MediaPlayerElement>(null);

  const onLoadedMetadata = (event: MediaLoadedMetadataEvent) => {
    const playerRef = player.current as any;
    if (!playerRef) return;

    // Add Chapters
    if (chapters && chapters.length > 0) {
      const existingTracks = playerRef.textTracks.getByKind('chapters');
      for (const track of existingTracks) playerRef.textTracks.remove(track);
      const track = new TextTrack({ kind: 'chapters', default: true, label: 'Chapters' });
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const nextChapter = chapters[i + 1];
        const startTime = chapter.StartPositionTicks / 10000000;
        const endTime = nextChapter ? (nextChapter.StartPositionTicks / 10000000) : playerRef.duration;
        if (isNaN(startTime) || isNaN(endTime) || startTime >= endTime) continue;
        track.addCue(new window.VTTCue(startTime, endTime, chapter.Name));
      }
      playerRef.textTracks.add(track);
    }

    // Add Subtitles
    if (subtitleTracks && subtitleTracks.length > 0) {
      for (const sub of subtitleTracks) {
        const track = new TextTrack({
          src: sub.src,
          kind: 'subtitles',
          label: sub.DisplayTitle,
          language: sub.Language,
          default: sub.IsDefault,
        });
        playerRef.textTracks.add(track);
      }
    }
  };

  if (!src) return null;

  const source = { src, type: container ? `video/${container.toLowerCase()}` : undefined };

  function onCanPlay(event: MediaCanPlayEvent) {
    if (player.current && startTime && (player.current as any).currentTime === 0) {
      (player.current as any).currentTime = startTime;
    }
  }

  function onError(event: MediaErrorEvent) {
    const detail = (event as any).detail;
    showError(`Erreur lecteur vidéo: ${detail.message}`);
  }

  function onTimeUpdateEvent(event: MediaTimeUpdateEvent) {
    if (onTimeUpdate) onTimeUpdate((event as any).detail.currentTime);
  }

  function onDurationChangeEvent(event: MediaDurationChangeEvent) {
    if (onDurationChange) onDurationChange((event as any).detail.duration);
  }

  return (
    <MediaPlayer
      key={src}
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
      <VideoLayout icons={customIcons} />
    </MediaPlayer>
  );
};

export default VideoPlayer;