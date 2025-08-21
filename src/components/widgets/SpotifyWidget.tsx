import { useTranslation } from 'react-i18next';

const SpotifyWidget = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-white text-center sm:text-left">{t('spotify_title')}</h3>
      <iframe
        style={{ borderRadius: '12px' }}
        src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0"
        width="100%"
        height="352"
        frameBorder="0"
        allowFullScreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Lecteur Spotify"
      ></iframe>
    </div>
  );
};

export default SpotifyWidget;