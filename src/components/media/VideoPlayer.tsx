import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';

import {
  MediaPlayer,
  MediaOutlet,
  MediaPlayButton,
  MediaMuteButton,
  MediaVolumeSlider,
  MediaTimeSlider,
  MediaTime,
  MediaPIPButton,
  MediaFullscreenButton,
  MediaMenu,
  MediaMenuButton,
  MediaMenuItems,
  MediaChaptersMenuItems,
  MediaCaptionButton,
  useMediaPlayer,
} from '@vidstack/react';
import { TextTrack } from 'vidstack';
import type {
  MediaPlayerElement,
  MediaCanPlayEvent,
  MediaErrorEvent,
  MediaTimeUpdateEvent,
  MediaDurationChangeEvent,
  MediaLoadedMetadataEvent,
  AudioTrack as IAudioTrack,
} from 'vidstack';
import { showError } from '@/utils/toast';
import { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  ListOrdered,
  Check,
  PictureInPicture,
  Maximize,
  Minimize,
  Subtitles,
} from 'lucide-react';

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

const AudioMenu = () => {
  const player = useMediaPlayer();
  const [tracks, setTracks] = useState<IAudioTrack[]>([]);

  useEffect(() => {
    if (!player) return;
    const onTracksChange = () => {
      // Fix for errors 1, 2, 3: Cast to `any` to bypass incorrect type error
      const newTracks = [...(player as any).audioTracks];
      setTracks(newTracks);
    };
    onTracksChange();
    (player as any).audioTracks.addEventListener('change', onTracksChange);
    return () => {
      (player as any).audioTracks.removeEventListener('change', onTracksChange);
    };
  }, [player]);

  const selectedTrack = tracks.find((t) => t.selected);

  if (tracks.length <= 1) return null;

  return (
    <MediaMenu>
      <MediaMenuButton className="vds-menu-button">
        <Volume2 className="h-5 w-5 mr-2" />
        <span>Audio ({selectedTrack?.label})</span>
      </MediaMenuButton>
      <MediaMenuItems className="vds-menu-items">
        {tracks.map((track, index) => (
          <MediaMenuButton
            key={track.id}
            className="vds-menu-button"
            // Fix for error 4: Use selectedIndex on the track list, which is the correct method.
            onClick={() => {
              if (player) (player as any).audioTracks.selectedIndex = index;
            }}
          >
            {track.selected && <Check className="h-4 w-4 mr-2" />}
            <span>{track.label}</span>
          </MediaMenuButton>
        ))}
      </MediaMenuItems>
    </MediaMenu>
  );
};

const VideoPlayer = ({ src, title, container, chapters, subtitleTracks, startTime, onTimeUpdate, onDurationChange }: VideoPlayerProps) => {
  const player = useRef<MediaPlayerElement>(null);

  const onLoadedMetadata = (event: MediaLoadedMetadataEvent) => {
    const playerRef = player.current as any;
    if (!playerRef) return;

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
      aspectRatio={16 / 9}
    >
      <MediaOutlet />
      <div className="absolute inset-0 z-10 flex h-full w-full flex-col justify-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-data-[controls]:opacity-100">
        <div className="flex-1"></div>
        <div className="p-2.5">
          <MediaTimeSlider />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MediaPlayButton className="vds-button">
                <Play className="vds-play-icon h-6 w-6" />
                <Pause className="vds-pause-icon h-6 w-6" />
              </MediaPlayButton>
              <MediaMuteButton className="vds-button">
                <Volume2 className="vds-mute-icon h-6 w-6" />
                <VolumeX className="vds-unmute-icon h-6 w-6" />
              </MediaMuteButton>
              <MediaVolumeSlider />
              <MediaTime />
            </div>
            <div className="flex items-center gap-2">
              {chapters && chapters.length > 0 && (
                <MediaMenu>
                  <MediaMenuButton className="vds-button">
                    <ListOrdered className="h-6 w-6" />
                  </MediaMenuButton>
                  <MediaMenuItems className="vds-menu-items">
                    <MediaChaptersMenuItems />
                  </MediaMenuItems>
                </MediaMenu>
              )}
              <MediaMenu>
                <MediaMenuButton className="vds-button">
                  <Settings className="h-6 w-6" />
                </MediaMenuButton>
                <MediaMenuItems className="vds-menu-items">
                  <AudioMenu />
                </MediaMenuItems>
              </MediaMenu>
              <MediaCaptionButton className="vds-button">
                <Subtitles className="h-6 w-6" />
              </MediaCaptionButton>
              <MediaPIPButton className="vds-button">
                <PictureInPicture className="h-6 w-6" />
              </MediaPIPButton>
              <MediaFullscreenButton className="vds-button">
                <Maximize className="vds-enter-fullscreen-icon h-6 w-6" />
                <Minimize className="vds-exit-fullscreen-icon h-6 w-6" />
              </MediaFullscreenButton>
            </div>
          </div>
        </div>
      </div>
    </MediaPlayer>
  );
};

export default VideoPlayer;