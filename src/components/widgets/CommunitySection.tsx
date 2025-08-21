import DiscordWidget from './DiscordWidget';
import CustomAudioPlayer from './CustomAudioPlayer';

const CommunitySection = () => {
  return (
    <div className="container mx-auto px-4 py-8 border-t border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <CustomAudioPlayer />
        <DiscordWidget />
      </div>
    </div>
  );
};

export default CommunitySection;