import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/contexts/AuthContext';
import { useRequestsByUserId, UserMediaRequest } from '@/hooks/useRequestsByUserId';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { MailQuestion, Calendar, Tv, Film, Clapperboard } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MyRequestsPage = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const { requests, loading, refreshRequests } = useRequestsByUserId(session?.user?.id);
  const [requestToDelete, setRequestToDelete] = useState<UserMediaRequest | null>(null);

  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const statusConfig = {
    pending: { text: t('status_pending'), className: 'bg-gray-500/20 text-gray-400 border-gray-500/30', ring: 'ring-gray-500/30' },
    approved: { text: t('status_approved'), className: 'bg-blue-500/20 text-blue-400 border-blue-500/30', ring: 'ring-blue-500/30' },
    rejected: { text: t('status_rejected'), className: 'bg-red-500/20 text-red-400 border-red-500/30', ring: 'ring-red-500/30' },
    available: { text: t('status_available'), className: 'bg-green-500/20 text-green-400 border-green-500/30', ring: 'ring-green-500/30' },
  };

  const mediaTypeIcons = {
    movie: <Film className="h-4 w-4" />,
    tv: <Tv className="h-4 w-4" />,
    anime: <Clapperboard className="h-4 w-4" />,
  };

  // Suppression directe (une seule action)

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    const { error } = await supabase
      .from('media_requests')
      .delete()
      .eq('id', requestToDelete.id);
    if (error) {
      showError(t('error_deleting_requests'));
    } else {
      showSuccess(t('requests_deleted_successfully'));
      refreshRequests();
    }
    setRequestToDelete(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <MailQuestion className="h-8 w-8" /> 
          {t('my_requests')}
        </h1>
        <p className="text-muted-foreground">{t('my_requests_description')}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className={`h-full flex flex-col overflow-hidden ring-2 ring-transparent transition-all ${statusConfig[request.status]?.ring}`}>
                <CardHeader className="flex flex-row items-start gap-4 p-4">
                  {request.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w154${request.poster_path}`}
                      alt={request.title ?? ''}
                      className="h-28 w-20 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-28 w-20 rounded-md bg-muted flex items-center justify-center">
                      {mediaTypeIcons[request.media_type] || <Clapperboard className="h-8 w-8 text-muted-foreground" />}
                    </div>
                  )}
                  <div className="flex-1">
                    <Badge variant="outline" className={`mb-2 ${statusConfig[request.status]?.className}`}>
                      {statusConfig[request.status]?.text}
                    </Badge>
                    <Link to={`/media/${request.media_type}/${request.tmdb_id}`} className="font-semibold leading-tight hover:underline text-lg">
                      {request.title}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{format(new Date(request.requested_at), 'd MMMM yyyy', { locale: currentLocale })}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    {mediaTypeIcons[request.media_type]}
                    <span className="ml-2 capitalize">{t(request.media_type)}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-2 bg-muted/30 border-t">
                  <Button variant="destructive" size="sm" className="w-full" onClick={() => setRequestToDelete(request)}>
                    {t('delete')}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <MailQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t('no_requests_yet')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('my_requests_empty_state_desc')}</p>
          <Button asChild className="mt-6">
           <Link to="/catalog">{t('go_to_catalog')}</Link>
          </Button>
        </div>
      )}

      {/* Confirmation suppression */}

      <AlertDialog open={!!requestToDelete} onOpenChange={(open) => !open && setRequestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_delete_request', { title: requestToDelete?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRequestToDelete(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className={buttonVariants({ variant: "destructive" })}>
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default MyRequestsPage;