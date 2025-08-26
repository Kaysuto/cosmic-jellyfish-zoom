import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import DiscordIcon from '@/components/icons/DiscordIcon';

interface DiscordWidgetData {
  name: string;
  instant_invite: string;
  presence_count: number;
}

const DiscordWidget = () => {
  const { t } = useTranslation();
  const [widgetData, setWidgetData] = useState<DiscordWidgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWidgetData = async () => {
      try {
        const response = await fetch('https://discord.com/api/guilds/1027968386640117770/widget.json');
        if (!response.ok) {
          throw new Error('Failed to fetch Discord widget data');
        }
        const data = await response.json();
        setWidgetData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWidgetData();
  }, []);

  if (loading) {
    return <Skeleton className="h-[220px] w-full" />;
  }

  if (!widgetData) {
    return null;
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
          <DiscordIcon className="h-8 w-8" />
          {t('discord_join_title')}
        </CardTitle>
        <CardDescription>{t('discord_join_desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">✓ {t('discord_benefit_1')}</li>
          <li className="flex items-center gap-2">✓ {t('discord_benefit_2')}</li>
          <li className="flex items-center gap-2">✓ {t('discord_benefit_3')}</li>
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button asChild size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
          <a href={widgetData.instant_invite} target="_blank" rel="noopener noreferrer">
            {t('discord_join_button')}
          </a>
        </Button>
        <div className="flex items-center gap-2 text-green-400">
          <Users className="h-5 w-5" />
          <span className="font-semibold">{t('discord_online_count', { count: widgetData.presence_count })}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DiscordWidget;