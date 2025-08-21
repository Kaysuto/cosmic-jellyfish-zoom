import DiscordWidget from './DiscordWidget';

const CommunitySection = () => {
  return (
    <div className="container mx-auto px-4 py-8 border-t border-white/10">
      <div className="flex justify-center">
        <div className="w-full md:w-1/2">
          <DiscordWidget />
        </div>
      </div>
    </div>
  );
};

export default CommunitySection;