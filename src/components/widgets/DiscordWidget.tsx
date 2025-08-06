import { useTranslation } from 'react-i18next';

const DiscordWidget = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-white text-center sm:text-left">Rejoignez-nous sur Discord</h3>
      <iframe
        src="https://ptb.discord.com/widget?id=1027968386640117770&theme=dark"
        width="100%"
        height="352"
        allowTransparency={true}
        frameBorder="0"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        className="rounded-lg"
        title="Widget Discord"
      ></iframe>
    </div>
  );
};

export default DiscordWidget;