import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/contexts/AuthContext';
import { useRequestsByUserId, UserMediaRequest } from '@/hooks/useRequestsByUserId';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { X, MailQuestion } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { showSuccess, showError } from '@/utils/toast';
import { motion } from 'framer-motion';

const MyRequestsPage = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const { requests, loading, refreshRequests } = useRequestsByUserId(session?.user?.id);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<UserMediaRequest | null>(null);

  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const statusConfig = {
    pending: { text: t('status_pending'), className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    approved: { text: t('status_approved'), className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    rejected: { text: t('status_rejected'), className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    available: { text: t('status_available'), className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  };

  const handleCancelClick = (request: UserMediaRequest) => {
    setRequestToCancel(request);
    setIsConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!requestToCancel) return;

    const { error } = await supabase
      .from('media_requests')
      .delete()
      .eq('id', requestToCancel.id);

    if (error) {
      showError(t('error_cancelling_request'));
    } else {
      showSuccess(t('request_cancelled_successfully'));
      refreshRequests();
    }
    setIsConfirmOpen(false);
    setRequestToCancel(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailQuestion className="h-6 w-6" />
            {t('my_requests')}
          </CardTitle>
          <CardDescription>{t('my_requests_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('title')}</TableHead>
                  <TableHead>{t('requested_on')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>{format(new Date(request.requested_at), 'd MMM yyyy', { locale: currentLocale })}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig[request.status]?.className}>
                        {statusConfig[request.status]?.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === 'pending' && (
                        <Button variant="ghost" size="sm" onClick={() => handleCancelClick(request)}>
                          <X className="mr-2 h-4 w-4" />
                          {t('cancel_request')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">{t('no_requests_yet')}</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_cancel_request_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_cancel_request_desc', { title: requestToCancel?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRequestToCancel(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className={buttonVariants({ variant: "destructive" })}>
              {t('cancel_request')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default MyRequestsPage;