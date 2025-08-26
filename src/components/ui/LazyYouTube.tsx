import React, { useState } from 'react';

interface Props {
  videoId: string;
  title?: string;
  className?: string;
}

/**
 * LazyYouTube
 * - Affiche une vignette + bouton PLAY.
 * - N'injecte l'iframe YouTube (youtube-nocookie) que lorsque l'utilisateur clique.
 * - Utiliser pour remplacer les iframes embed directes afin de réduire les requêtes réseau initiales
 *   (et donc les erreurs console liées aux scripts publicitaires lorsque l'utilisateur a un adblocker).
 */
const LazyYouTube: React.FC<Props> = ({ videoId, title, className }) => {
  const [loaded, setLoaded] = useState(false);
  const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className={`relative w-full ${className ?? ''}`}>
      {!loaded ? (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          aria-label={title ? `Play ${title}` : 'Play video'}
          className="relative block w-full aspect-video bg-black overflow-hidden rounded-lg"
        >
          <img src={thumbnail} alt={title ?? 'YouTube video'} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg width="72" height="72" viewBox="0 0 24 24" className="text-white" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </div>
        </button>
      ) : (
        <div className="w-full aspect-video rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`}
            title={title ?? 'YouTube video'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
};

export default LazyYouTube;