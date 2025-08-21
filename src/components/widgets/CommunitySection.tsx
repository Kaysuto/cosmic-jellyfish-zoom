import DiscordWidget from './DiscordWidget';
import SpotifyWidget from './SpotifyWidget';

const CommunitySection = () => {
  return (
    <div className="container mx-auto px-4 py-8 border-t border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <SpotifyWidget />
        <DiscordWidget />
      </div>
    </div>
  );
};

export default CommunitySection;