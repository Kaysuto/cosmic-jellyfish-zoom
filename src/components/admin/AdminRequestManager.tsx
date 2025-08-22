import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Check, X, Download, Hourglass } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGravatarURL } from '@/lib/gravatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface MediaRequest {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'available';
  requested_at: string;
  media_type: 'movie' | 'tv' | 'anime';
  user_id: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

const AdminRequestManager = () => {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'available'>('pending');
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      let query = supabase
        .from('media_requests')
        .select('*, profiles!user_id(*)');

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query.order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
      } else {
        setRequests(data as MediaRequest[]);
      }
      setLoading(false);
    };

    fetchRequests();
  }, [filterStatus]);

  const handleStatusChange = async (requestId: string, newStatus: MediaRequest['status']) => {
    const { error } = await supabase
      .from('media_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', requestId);
    
    if (error) {
      showError(t('error_updating_status'));
    } else {
      showSuccess(t('status_updated_successfully'));
      setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
    }
  };

  const statusConfig = {
    pending: { text: t('status_pending'), className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    approved: { text: t('status_approved'), className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    rejected: { text: t('status_rejected'), className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    available: { text: t('status_available'), className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="flex justify-end mb-4">
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('filter_by_status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_statuses')}</SelectItem>
            <SelectItem value="pending">{t('status_pending')}</SelectItem>
            <SelectItem value="approved">{t('status_approved')}</SelectItem>
            <SelectItem value="rejected">{t('status_rejected')}</SelectItem>
            <SelectItem value="available">{t('status_available')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('title')}</TableHead>
            <TableHead>{t('requester')}</TableHead>
            <TableHead>{t('date')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map(req => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">{req.title}</TableCell>
              <TableCell>
                {req.profiles ? (
                  <Link to={`/users/${req.user_id}`} className="flex items-center gap-2 hover:underline">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={req.profiles.avatar_url || getGravatarURL(req.profiles.email)} />
                      <AvatarFallback>{req.profiles.first_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <span>{req.profiles.first_name} {req.profiles.last_name}</span>
                  </Link>
                ) : (
                  <span>{t('unknown_user')}</span>
                )}
              </TableCell>
              <TableCell>{format(new Date(req.requested_at), 'd MMM yyyy', { locale: currentLocale })}</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusConfig[req.status]?.className}>
                  {statusConfig[req.status]?.text}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'approved')}><Check className="mr-2 h-4 w-4 text-blue-500" />{t('status_approved')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'available')}><Download className="mr-2 h-4 w-4 text-green-500" />{t('status_available')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'rejected')}><X className="mr-2 h-4 w-4 text-red-500" />{t('status_rejected')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'pending')}><Hourglass className="mr-2 h-4 w-4 text-gray-500" />{t('status_pending')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {requests.length === 0 && <p className="text-center text-muted-foreground py-8">{t('no_requests_in_this_category')}</p>}
    </motion.div>
  );
};

export default AdminRequestManager;