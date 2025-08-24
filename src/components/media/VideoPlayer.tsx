import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';

import { 
  MediaPlayer, 
  MediaOutlet, 
  MediaTimeSlider, 
  MediaPlayButton, 
  MediaMuteButton, 
  MediaVolumeSlider, 
  MediaTime, 
  MediaMenu, 
  MediaMenuButton, 
  MediaMenuItems, 
  MediaChaptersMenuItems, 
  MediaPIPButton, 
  MediaFullscreenButton, 
  MediaCaptionButton,
  // MediaGoogleCastButton, // Nécessite une version plus récente de vidstack
} from '@vidstack/react';
import { TextTrack } from 'vidstack';
import { Settings, ListOrdered, Volume2, Check } from 'lucide-react';
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

const VideoPlayer = ({ src, title, container, chapters, audioTracks, subtitleTracks, startTime, onTimeUpdate, onDurationChange }: VideoPlayerProps) => {
  const player = useRef<MediaPlayerElement>(null);
  const [playerState, setPlayerState] = useState<MediaPlayerElement | null>(null);
  
  useEffect(() => {
    if (player.current) {
      setPlayerState(player.current);
    }
  }, [player.current]);

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
        <div className="p-2.5">
          <MediaTimeSlider className="mb-2" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MediaPlayButton />
              <MediaMuteButton />
              <MediaVolumeSlider />
              <MediaTime />
            </div>
            <div className="flex items-center gap-2">
              <MediaMenu>
                <MediaMenuButton className="vds-button">
                  <Settings className="h-6 w-6" />
                </MediaMenuButton>
                <MediaMenuItems className="vds-menu-items">
                  {playerState && (playerState as any).audioTracks.length > 1 && (
                    <MediaMenu>
                      <MediaMenuButton className="vds-menu-button">
                        <Volume2 className="w-5 h-5 mr-2" />
                        <span>Audio ({(playerState as any).audioTracks.selected?.label})</span>
                      </MediaMenuButton>
                      <MediaMenuItems>
                        {(playerState as any).audioTracks.map((track: IAudioTrack) => (
                          <MediaMenuButton key={track.id} className="vds-menu-button" onClick={() => track.selected = true}>
                            {track.selected && <Check className="w-4 h-4 mr-2" />}
                            <span>{track.label}</span>
                          </MediaMenuButton>
                        ))}
                      </MediaMenuItems>
                    </MediaMenu>
                  )}
                  {chapters && chapters.length > 0 && (
                    <MediaMenu>
                      <MediaMenuButton className="vds-menu-button">
                        <ListOrdered className="w-5 h-5 mr-2" />
                        <span>Chapitres</span>
                      </MediaMenuButton>
                      <MediaMenuItems>
                        <MediaChaptersMenuItems />
                      </MediaMenuItems>
                    </MediaMenu>
                  )}
                </MediaMenuItems>
              </MediaMenu>
              <MediaCaptionButton />
              {/* <MediaGoogleCastButton /> */}
              <MediaPIPButton />
              <MediaFullscreenButton />
            </div>
          </div>
        </div>
      </div>
    </MediaPlayer>
  );
};

export default VideoPlayer;