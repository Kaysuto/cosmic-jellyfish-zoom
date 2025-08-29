import { useState, useEffect } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Check, X, Download, Hourglass, MailQuestion, Trash2, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGravatarURL } from '@/lib/gravatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MediaRequest as BaseMediaRequest } from '@/types/supabase';

interface MediaRequest extends BaseMediaRequest {
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

const AdminRequestManager = () => {
  const { t, i18n } = useSafeTranslation();
  const { syncApprovedRequests, connectionStatus } = useJellyfin();
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'delete' | 'set_completed' | 'set_pending' | null>(null);
  
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let requestQuery = supabase.from('media_requests').select('*');
      if (filterStatus !== 'all') {
        requestQuery = requestQuery.eq('status', filterStatus);
      }
      const { data: requestData, error: requestError } = await requestQuery.order('updated_at', { ascending: false });

      if (requestError) {
        throw requestError;
      }
      
      if (!requestData || requestData.length === 0) {
        setRequests([]);
        return;
      }

      const userIds = [...new Set(requestData.map((req: any) => req.user_id).filter(Boolean))];

      if (userIds.length === 0) {
        setRequests(requestData.map(r => ({ ...r, profiles: null })));
        return;
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profileError) {
        throw profileError;
      }

      const profileMap = new Map(profileData.map((p: any) => [p.id, p]));
      
      const combinedData = requestData.map((req: any) => ({
        ...req,
        profiles: profileMap.get(req.user_id) || null,
      }));

      setRequests(combinedData as MediaRequest[]);
      
    } catch (error: any) {
      showError(t('error_fetching_requests') + ': ' + error.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel('media_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media_requests' }, fetchRequests)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterStatus]);

  const handleStatusChange = async (ids: number[], newStatus: BaseMediaRequest['status']) => {
    const { error } = await supabase
      .from('media_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (error) {
      showError(t('error_updating_status'));
    } else {
      showSuccess(t('status_updated_successfully'));
      fetchRequests(); // Refresh data
    }
  };
  
  const handleDelete = async (ids: number[]) => {
    const { error } = await supabase.from('media_requests').delete().in('id', ids);
    if (error) {
      showError(t('error_deleting_requests'));
    } else {
      showSuccess(t('requests_deleted_successfully'));
      fetchRequests(); // Refresh data
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === requests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(requests.map(r => r.id)));
    }
  };
  
  const openBulkConfirm = (action: typeof bulkAction) => {
    setBulkAction(action);
    setBulkConfirmOpen(true);
  }

  const performBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    
    if (bulkAction === 'delete') {
      await handleDelete(ids);
    } else if (bulkAction) {
      const newStatus = bulkAction.replace('set_', '') as BaseMediaRequest['status'];
      await handleStatusChange(ids, newStatus);
    }

    setBulkConfirmOpen(false);
    setSelectedIds(new Set());
  };

  const handleSyncRequests = async () => {
    if (connectionStatus !== 'connected') {
      showError(t('jellyfin_not_connected'));
      return;
    }

    setSyncing(true);
    try {
      await syncApprovedRequests();
      showSuccess(t('sync_success'));
      fetchRequests(); // Rafraîchir les données
    } catch (error: any) {
      showError(t('sync_error') + ': ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const statusConfig = {
    pending: { text: t('status_pending'), className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    approved: { text: t('status_approved'), className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    rejected: { text: t('status_rejected'), className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    completed: { text: t('status_completed'), className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  };

  // Helper to resolve poster path: prefer canonical `poster_path`, fallback to `media_poster_path`.
  const getPosterPath = (r: MediaRequest) => r.poster_path ?? '';

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      } else {
        setViewMode('list');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderRequestList = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"><Checkbox checked={selectedIds.size === requests.length && requests.length > 0} onCheckedChange={toggleSelectAll} /></TableHead>
          <TableHead className="w-16">{t('poster')}</TableHead>
          <TableHead>{t('title')}</TableHead>
          <TableHead>{t('requester')}</TableHead>
          <TableHead>{t('date')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          <TableHead className="text-right">{t('actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map(req => (
          <TableRow key={req.id} className={selectedIds.has(req.id) ? 'bg-muted/50' : ''}>
            <TableCell><Checkbox checked={selectedIds.has(req.id)} onCheckedChange={() => toggleSelect(req.id)} /></TableCell>
            <TableCell>
              <img src={`https://image.tmdb.org/t/p/w92${getPosterPath(req)}`} alt="" className="h-12 w-9 rounded-md object-cover" />
            </TableCell>
            <TableCell><Link to={`/media/${req.media_type}/${req.tmdb_id}`} className="font-medium hover:underline">{req.title}</Link></TableCell>
            <TableCell>
              <Link to={`/profile/${req.user_id}`} className="flex items-center gap-2 hover:underline">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={req.profiles?.avatar_url || getGravatarURL(req.profiles?.email)} />
                  <AvatarFallback>{req.profiles?.first_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                {req.profiles?.first_name} {req.profiles?.last_name}
              </Link>
            </TableCell>
            <TableCell>{format(new Date(req.updated_at), 'd MMM yyyy', { locale: currentLocale })}</TableCell>
            <TableCell><Badge variant="outline" className={statusConfig[req.status]?.className}>{statusConfig[req.status].text}</Badge></TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStatusChange([req.id], 'approved')}><Check className="mr-2 h-4 w-4" /> {t('status_approved')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange([req.id], 'completed')}><Download className="mr-2 h-4 w-4" /> {t('status_completed')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange([req.id], 'rejected')}><X className="mr-2 h-4 w-4" /> {t('status_rejected')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange([req.id], 'pending')}><Hourglass className="mr-2 h-4 w-4" /> {t('status_pending')}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500" onClick={() => handleDelete([req.id])}><Trash2 className="mr-2 h-4 w-4" /> {t('delete')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderRequestGrid = () => (
    <div className="relative">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {requests.map(req => (
          <Card key={req.id} className={`overflow-hidden transition-all ${selectedIds.has(req.id) ? 'border-primary ring-2 ring-primary' : ''}`}>
            <CardHeader className="p-0">
              <div className="relative">
                <Checkbox
                  checked={selectedIds.has(req.id)}
                  onCheckedChange={() => toggleSelect(req.id)}
                  className="absolute top-2 left-2 z-10 bg-background/50 border-white/50"
                />
                <img src={`https://image.tmdb.org/t/p/w500${getPosterPath(req)}`} alt="" className="aspect-[2/3] object-cover w-full" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                <Badge variant="outline" className={`absolute top-2 right-2 ${statusConfig[req.status]?.className}`}>
                  {statusConfig[req.status].text}
                </Badge>
                <Link to={`/media/${req.media_type}/${req.tmdb_id}`} className="absolute bottom-2 left-3 right-3 font-bold text-white hover:underline text-sm">
                  {req.title}
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <Link to={`/profile/${req.user_id}`} className="flex items-center gap-2 hover:underline text-xs">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={req.profiles?.avatar_url || getGravatarURL(req.profiles?.email)} />
                  <AvatarFallback>{req.profiles?.first_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <span className="truncate">{req.profiles?.first_name} {req.profiles?.last_name}</span>
              </Link>
              <p className="text-xs text-muted-foreground mt-1">{format(new Date(req.updated_at), 'd MMM yyyy', { locale: currentLocale })}</p>
            </CardContent>
            <CardFooter className="p-2 bg-muted/30 border-t"> 
              <div className="flex w-full gap-1">
                <Button title={t('approve')} size="sm" className="flex-1 h-7" variant="outline" onClick={() => handleStatusChange([req.id], 'approved')}><Check className="h-3 w-3" /></Button>
                <Button title={t('reject')} size="sm" className="flex-1 h-7" variant="outline" onClick={() => handleStatusChange([req.id], 'rejected')}><X className="h-3 w-3" /></Button>
                <Button title={t('set_completed')} size="sm" className="flex-1 h-7" variant="outline" onClick={() => handleStatusChange([req.id], 'completed')}><Download className="h-3 w-3" /></Button>
                <Button title={t('delete')} size="sm" className="flex-1 h-7 text-red-500" variant="outline" onClick={() => handleDelete([req.id])}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
                <MailQuestion className="h-7 w-7" />
                {t('admin_manage_requests')}
            </h1>
          <p className="text-muted-foreground">{t('my_requests_description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_statuses')}</SelectItem>
              <SelectItem value="pending">{t('status_pending')}</SelectItem>
              <SelectItem value="approved">{t('status_approved')}</SelectItem>
              <SelectItem value="rejected">{t('status_rejected')}</SelectItem>
              <SelectItem value="completed">{t('status_completed')}</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleSyncRequests} 
            disabled={syncing || connectionStatus !== 'connected'}
            className="flex items-center gap-2"
          >
            {syncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {syncing ? t('sync_in_progress') : t('sync_approved_requests')}
          </Button>
          <div className="hidden md:flex p-1 bg-muted rounded-lg">
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>
      
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-muted/50 border rounded-lg p-3 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <span className="text-sm font-medium">{t('items_selected', { count: selectedIds.size })}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => openBulkConfirm('approve')}><Check className="mr-2 h-4 w-4" /> {t('approve')}</Button>
              <Button size="sm" variant="outline" onClick={() => openBulkConfirm('reject')}><X className="mr-2 h-4 w-4" /> {t('reject')}</Button>
               <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openBulkConfirm('set_completed')}><Download className="mr-2 h-4 w-4" /> {t('status_completed')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openBulkConfirm('set_pending')}><Hourglass className="mr-2 h-4 w-4" /> {t('status_pending')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="destructive" className="ml-2" onClick={() => openBulkConfirm('delete')}><Trash2 className="mr-2 h-4 w-4" /> {t('delete')}</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : requests.length > 0 ? (
        <div>
          {viewMode === 'list' ? renderRequestList() : renderRequestGrid()}
        </div>
      ) : (
        <div className="text-center py-16">
          <MailQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t('no_requests_to_display')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('no_requests_for_status')}</p>
        </div>
      )}

      <AlertDialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_action')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_action_on_selected', { count: selectedIds.size })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={performBulkAction}>{t('confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default AdminRequestManager;