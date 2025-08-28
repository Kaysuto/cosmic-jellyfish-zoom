import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import DiscordIcon from '@/components/icons/DiscordIcon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DiscordWidgetData {
  name: string;
  instant_invite: string;
  presence_count: number;
}

const DiscordWidget = () => {
  const { t } = useTranslation();
  const [widgetData, setWidgetData] = useState<DiscordWidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirmJoin = () => {
    if (widgetData?.instant_invite) {
      window.open(widgetData.instant_invite, '_blank', 'noopener,noreferrer');
    }
    setIsConfirmOpen(false);
  };

  if (loading) {
    return <Skeleton className="h-32 w-full rounded-lg" />;
  }

  if (!widgetData) {
    return null;
  }

  return (
    <>
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <DiscordIcon className="h-12 w-12 text-[#5865F2] flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-white">{t('discord_join_title')}</h3>
            <p className="text-muted-foreground text-sm">{t('discord_join_desc')}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 w-full sm:w-auto flex-shrink-0">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-[#5865F2] hover:bg-[#4f5bda] text-white font-semibold shadow-lg transform hover:scale-105 transition-transform"
            onClick={handleJoinClick}
          >
            {t('discord_join_button')}
          </Button>
          <div className="flex items-center gap-2 text-green-400 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>{t('discord_online_count', { count: widgetData.presence_count })}</span>
          </div>
        </div>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_discord_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_discord_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmJoin}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white border-[#5865F2]"
            >
              {t('continue_to_discord')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DiscordWidget;