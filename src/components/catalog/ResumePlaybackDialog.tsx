import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContinueWatchingItem } from "@/hooks/useContinueWatching";
import { useSafeTranslation } from "@/hooks/useSafeTranslation";
import { X } from 'lucide-react';

interface ResumePlaybackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContinueWatchingItem | null;
  onResume: () => void;
  onRestart: () => void;
  onViewDetails: () => void;
}

const ResumePlaybackDialog = ({ open, onOpenChange, item, onResume, onRestart, onViewDetails }: ResumePlaybackDialogProps) => {
  const { t } = useSafeTranslation();

  if (!item) return null;

  const resumeTimeInSeconds = Math.floor(item.playback_position_ticks / 10000000);
  const minutes = Math.floor(resumeTimeInSeconds / 60);
  const seconds = resumeTimeInSeconds % 60;
  const resumeTimeString = `${minutes}m ${seconds}s`;

  const title = item.title || item.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {t('resume_or_restart_description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="secondary" onClick={onViewDetails}>
            {t('view_details')}
          </Button>
          <Button variant="outline" onClick={onRestart}>
            {t('restart_playback')}
          </Button>
          <Button onClick={onResume}>
            {t('resume_at', { time: resumeTimeString })}
          </Button>
        </DialogFooter>
        <DialogClose asChild className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <Button variant="ghost" size="icon">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default ResumePlaybackDialog;