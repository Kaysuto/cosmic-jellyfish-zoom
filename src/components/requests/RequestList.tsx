import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Film, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { showError, showSuccess } from '@/utils/toast';

interface MediaRequest {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'available';
  poster_path: string;
  requested_at: string;
  media_type: 'movie' | 'tv' | 'anime';
}

const RequestList = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<MediaRequest | null>(null);
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  useEffect(() => {
    const fetchRequests = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('media_requests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
      } else {
        setRequests(data as MediaRequest[]);
      }
      setLoading(false);
    };

    fetchRequests();
  }, [session]);

  const confirmDelete = (request: MediaRequest) => {
    setRequestToDelete(request);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!requestToDelete) return;

    const { error } = await supabase
      .from('media_requests')
      .delete()
      .eq('id', requestToDelete.id);

    if (error) {
      showError(t('error_deleting_request'));
      console.error('Error deleting request:', error);
    } else {
      showSuccess(t('request_deleted_successfully'));
      setRequests(prev => prev.filter(r => r.id !== requestToDelete.id));
    }

    setIsDeleteDialogOpen(false);
    setRequestToDelete(null);
  };

  const statusConfig = {
    pending: { text: t('status_pending'), className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    approved: { text: t('status_approved'), className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    rejected: { text: t('status_rejected'), className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    available: { text: t('status_available'), className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
      </div>
    );
  }

  if (requests.length === 0) {
    return <p className="text-center text-muted-foreground py-8">{t('no_requests_yet')}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {requests.map(req => (
          <div key={req.id} className="relative bg-muted/30 rounded-lg overflow-hidden flex items-center gap-4 p-4 border border-border group">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => confirmDelete(req)}
              aria-label={t('delete')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="w-20 h-28 flex-shrink-0 bg-muted rounded-md">
              {req.poster_path ? (
                <img src={`https://image.tmdb.org/t/p/w200${req.poster_path}`} alt={req.title} className="w-full h-full object-cover rounded-md" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Film className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between h-full flex-grow">
              <div>
                <h3 className="font-semibold line-clamp-2">{req.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('requested_on')} {format(new Date(req.requested_at), 'd MMM yyyy', { locale: currentLocale })}
                </p>
              </div>
              <Badge variant="outline" className={`mt-2 self-start ${statusConfig[req.status]?.className}`}>
                {statusConfig[req.status]?.text}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_delete_request', { title: requestToDelete?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRequestToDelete(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RequestList;