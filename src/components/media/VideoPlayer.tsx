import ReactPlayer from 'react-player/lazy';

interface VideoPlayerProps {
  src: string;
  title: string;
}

const VideoPlayer = ({ src, title }: VideoPlayerProps) => {
  if (!src) return null;

  // Le titre est utilisé par ReactPlayer pour l'accessibilité, même s'il n'est pas visible.
  console.log(`Chargement de la vidéo : ${title} depuis ${src}`);

  return (
    <div className='player-wrapper w-full h-full bg-black'>
      <ReactPlayer
        className='react-player'
        url={src}
        width='100%'
        height='100%'
        controls={true}
        playing={true}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload', // Empêche le bouton de téléchargement sur certains navigateurs
              title: title,
            }
          }
        }}
        onError={e => console.error('Erreur ReactPlayer:', e)}
      />
    </div>
  );
};

export default VideoPlayer;