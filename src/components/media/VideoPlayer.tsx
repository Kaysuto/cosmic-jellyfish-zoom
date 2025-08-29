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
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title: string;
  container?: string | null;
  chapters?: any[] | null;
  subtitleTracks?: any[];
  startTime?: number | null;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  selectedSubtitleIndex?: string | null;
  onBack: () => void;
}

const VideoPlayer = ({ src, title, container, chapters, subtitleTracks, startTime, onTimeUpdate, onDurationChange, selectedSubtitleIndex, onBack }: VideoPlayerProps) => {
  const player = useRef<MediaPlayerElement>(null);
  const { t } = useSafeTranslation();

  const onLoadedMetadata = (_event: MediaLoadedMetadataEvent) => {
    const playerRef = player.current as any;
    if (!playerRef) return;

    // Notifier la durée dès que les métadonnées sont chargées
    if (onDurationChange && !isNaN(playerRef.duration) && playerRef.duration > 0) {
      onDurationChange(playerRef.duration);
    }

    // Add Chapters (with fallbacks and title normalization)
    const existingTracks = playerRef.textTracks.getByKind('chapters');
    for (const track of existingTracks) playerRef.textTracks.remove(track);
    const chapterTrack = new TextTrack({ kind: 'chapters', default: true, label: 'Chapters' });

    const hasProvidedChapters = Array.isArray(chapters) && chapters.length > 0;
    if (hasProvidedChapters) {
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const nextChapter = chapters[i + 1];
        const startTime = Number(chapter?.StartPositionTicks || 0) / 10000000;
        const endTime = nextChapter ? (Number(nextChapter?.StartPositionTicks || 0) / 10000000) : playerRef.duration;
        if (isNaN(startTime) || isNaN(endTime) || startTime >= endTime) continue;
        const label = (chapter?.Name && String(chapter.Name).trim().length > 0) ? String(chapter.Name) : `Chapitre ${i + 1}`;
        chapterTrack.addCue(new window.VTTCue(startTime, endTime, label));
      }
    } else if (!isNaN(playerRef.duration) && playerRef.duration > 0) {
      // Fallback synthetic chapters when none are provided
      const d = playerRef.duration;
      const cueDefs = [
        { s: 0, e: Math.min(d * 0.5, d), label: 'Début' },
        { s: Math.min(d * 0.5, d - 1), e: Math.min(d * 0.9, d), label: 'Milieu' },
        { s: Math.min(d * 0.9, d - 1), e: d, label: 'Générique' },
      ];
      for (const c of cueDefs) {
        if (!isNaN(c.s) && !isNaN(c.e) && c.s < c.e) {
          chapterTrack.addCue(new window.VTTCue(c.s, c.e, c.label));
        }
      }
    }
    if (chapterTrack.cues.length > 0) {
      playerRef.textTracks.add(chapterTrack);
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

    // Ensure resume position is applied as soon as metadata is ready
    if (typeof startTime === 'number' && !isNaN(startTime) && startTime > 0) {
      try {
        playerRef.currentTime = startTime;
      } catch {}
    }
  };

  if (!src) return null;

  const source = { src, type: container ? `video/${container.toLowerCase()}` : undefined };

  function onCanPlay(_event: MediaCanPlayEvent) {
    if (player.current && typeof startTime === 'number' && !isNaN(startTime)) {
      const current = (player.current as any).currentTime;
      if (Math.abs(current - startTime) > 0.5) {
        (player.current as any).currentTime = startTime;
      }
    }
  }

  function onError(_event: MediaErrorEvent) {
    const detail = (_event as any).detail;
    showError(`Erreur lecteur vidéo: ${detail.message}`);
  }

  function onTimeUpdateEvent(_event: MediaTimeUpdateEvent) {
    if (onTimeUpdate) onTimeUpdate((_event as any).detail.currentTime);
  }

  function onDurationChangeEvent(_event: MediaDurationChangeEvent) {
    if (onDurationChange) onDurationChange((_event as any).detail.duration);
  }
 function onEnded(_event: MediaEndedEvent) {
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
      <MediaCommunitySkin 
        style={{
          '--media-pip-button-display': 'none'
        } as React.CSSProperties}
      />
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