import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';

import { 
  MediaPlayer, 
  MediaOutlet, 
  MediaCommunitySkin
} from '@vidstack/react';
import { TextTrack } from 'vidstack';
import type { 
  MediaPlayerElement,
  MediaCanPlayEvent,
  MediaErrorEvent,
  MediaTimeUpdateEvent,
 MediaDurationChangeEvent,
 MediaLoadedMetadataEvent,
 MediaEndedEvent,
} from 'vidstack';
import { showError } from '@/utils/toast';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
  selectedSubtitleIndex?: string | null;
  onBack: () => void;
}

const VideoPlayer = ({ src, title, container, chapters, subtitleTracks, startTime, onTimeUpdate, onDurationChange, selectedSubtitleIndex, onBack }: VideoPlayerProps) => {
  const player = useRef<MediaPlayerElement>(null);
  const { t } = useTranslation();

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
        const isSelected = selectedSubtitleIndex ? sub.Index.toString() === selectedSubtitleIndex : false;
        const track = new TextTrack({
          src: sub.src,
          kind: 'subtitles',
          label: sub.DisplayTitle,
          language: sub.Language,
          default: isSelected,
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
 function onEnded(event: MediaEndedEvent) {
   window.dispatchEvent(new CustomEvent('playback-ended'));
 }

  return (
    <MediaPlayer
      key={src}
      ref={player}
      className="w-full max-h-screen group"
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
     onEnded={onEnded}
      aspectRatio={16 / 9}
    >
      <MediaOutlet />
      <MediaCommunitySkin />
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="absolute top-4 left-4 z-20 text-white bg-black/50 hover:bg-black/75 hover:text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label={t('back')}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </MediaPlayer>
  );
};

export default VideoPlayer;