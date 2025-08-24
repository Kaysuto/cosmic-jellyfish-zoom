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
import { Button } from "@/components/ui/button";
import { ContinueWatchingItem } from "@/hooks/useContinueWatching";
import { useTranslation } from "react-i18next";

interface ResumePlaybackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContinueWatchingItem | null;
  onResume: () => void;
  onRestart: () => void;
}

const ResumePlaybackDialog = ({ open, onOpenChange, item, onResume, onRestart }: ResumePlaybackDialogProps) => {
  const { t } = useTranslation();

  if (!item) return null;

  const resumeTimeInSeconds = Math.floor(item.playback_position_ticks / 10000000);
  const minutes = Math.floor(resumeTimeInSeconds / 60);
  const seconds = resumeTimeInSeconds % 60;
  const resumeTimeString = `${minutes}m ${seconds}s`;

  const title = item.title || item.name;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('resume_or_restart_description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={onRestart}>
            {t('restart_playback')}
          </Button>
          <AlertDialogAction onClick={onResume}>
            {t('resume_at', { time: resumeTimeString })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResumePlaybackDialog;