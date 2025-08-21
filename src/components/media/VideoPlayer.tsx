import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';

import { MediaPlayer, MediaOutlet, MediaCommunitySkin } from '@vidstack/react';

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
    >
      <MediaOutlet />
      <MediaCommunitySkin />
    </MediaPlayer>
  );
};

export default VideoPlayer;