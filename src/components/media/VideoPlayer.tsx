import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { DefaultVideoLayout } from '@vidstack/react/layouts/default';
import { defaultLayoutIcons } from '@vidstack/react/layouts/default/icons';

interface VideoPlayerProps {
  src: string;
  title: string;
}

const VideoPlayer = ({ src, title }: VideoPlayerProps) => {
  if (!src) return null;

  return (
    <MediaPlayer
      className="w-full h-full"
      title={title}
      src={src}
      playsInline
      autoPlay
      aspectRatio="16/9"
    >
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
};

export default VideoPlayer;