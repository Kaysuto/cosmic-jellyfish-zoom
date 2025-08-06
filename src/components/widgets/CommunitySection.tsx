import DiscordWidget from './DiscordWidget';
import SpotifyPlayer from './SpotifyPlayer';

const CommunitySection = () => {
  return (
    <div className="container mx-auto px-4 py-8 border-t border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        <SpotifyPlayer />
        <DiscordWidget />
      </div>
    </div>
  );
};

export default CommunitySection;