import ReactPlayer from 'react-player/lazy';

interface VideoPlayerProps {
  src: string;
  title: string;
}

const VideoPlayer = ({ src, title }: VideoPlayerProps) => {
  if (!src) return null;

  return (
    <div className='player-wrapper w-full h-full bg-black'>
      <ReactPlayer
        className='react-player'
        url={src}
        width='100%'
        height='100%'
        playing={true}
        controls={true}
        config={{
          file: {
            attributes: {
              title: title,
            },
            forceHLS: true,
          },
        }}
      />
    </div>
  );
};

export default VideoPlayer;