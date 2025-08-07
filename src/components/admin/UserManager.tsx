import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, MoreHorizontal, User, Shield, KeyRound, ShieldOff, Info, Edit, ArrowUpDown, Search } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGravatarURL } from '@/lib/gravatar';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/hooks/useProfile';
import { useSession } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

type SortByType = 'updated_at' | 'email' | 'first_name' | 'role' | 'mfa';

const UserManager = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const { users, loading, refreshUsers } = useUsers();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [isMfaDialogOpen, setIsMfaDialogOpen] = useState(false);
  const [userToEditMfa, setUserToEditMfa] = useState<Profile | null>(null);
  const [mfaUserIds, setMfaUserIds] = useState<string[]>([]);
  const [loadingMfa, setLoadingMfa] = useState(true);

  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortByType>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const fetchMfaStatus = useCallback(async () => {
    setLoadingMfa(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-mfa-factors');
      if (error) throw error;
      setMfaUserIds(data.userIds || []);
    } catch (error: any) {
      console.error('Error fetching MFA status:', error);
      showError(t('error_fetching_mfa_status'));
    } finally {
      setLoadingMfa(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMfaStatus();
  }, [fetchMfaStatus]);

  const filteredAndSortedUsers = useMemo(() => {
    return users
      .filter(user => {
        if (filterRole !== 'all' && user.role !== filterRole) {
          return false;
        }
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
          const email = user.email?.toLowerCase() || '';
          if (!fullName.includes(term) && !email.includes(term)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        let aValue: string | boolean, bValue: string | boolean;

        switch (sortBy) {
          case 'mfa':
            aValue = mfaUserIds.includes(a.id);
            bValue = mfaUserIds.includes(b.id);
            break;
          case 'first_name':
            aValue = `${a.first_name || ''} ${a.last_name || ''}`;
            bValue = `${b.first_name || ''} ${b.last_name || ''}`;
            break;
          default:
            aValue = a[sortBy] || '';
            bValue = b[sortBy] || '';
        }
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [users, filterRole, searchTerm, sortBy, sortOrder, mfaUserIds]);

  const handleSort = (column: SortByType) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const confirmDelete = (user: Profile) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const { error } = await supabase.functions.invoke('delete-user', { body: { userId: userToDelete.id } });
      if (error) throw error;
      showSuccess(t('user_deleted_successfully'));
      refreshUsers();
    } catch (error: any) {
      showError(`${t('error_deleting_user')}: ${error.message}`);
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) showError(t('error_updating_role'));
    else {
      showSuccess(t('role_updated_successfully'));
      refreshUsers();
    }
  };

  const confirmDisableMfa = (user: Profile) => {
    setUserToEditMfa(user);
    setIsMfaDialogOpen(true);
  };

  const handleDisableMfa = async () => {
    if (!userToEditMfa) return;
    try {
      const { error } = await supabase.functions.invoke('admin-unenroll-mfa', { body: { userId: userToEditMfa.id } });
      if (error) throw error;
      showSuccess(t('mfa_disabled_for_user', { email: userToEditMfa.email }));
      fetchMfaStatus();
    } catch (error: any) {
      showError(`${t('error_disabling_mfa')}: ${error.message}`);
    } finally {
      setIsMfaDialogOpen(false);
      setUserToEditMfa(null);
    }
  };

  if (loading || loadingMfa) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-96 w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('manage_users')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="relative w-full sm:w-auto sm:flex-grow max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search_user_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={filterRole} onValueChange={(value) => setFilterRole(value as any)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('filter_by_role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_roles')}</SelectItem>
                  <SelectItem value="admin">{t('admin_role')}</SelectItem>
                  <SelectItem value="user">{t('user_role')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('first_name')}>
                    {t('user_header')} <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('role')}>
                    {t('role')} <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('mfa')}>
                    MFA <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('updated_at')}>
                    {t('last_update')} <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedUsers.map((user) => {
                const hasMfa = mfaUserIds.includes(user.id);
                const isCurrentUser = user.id === session?.user?.id;
                return (
                  <TableRow key={user.id} className={isCurrentUser ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarImage src={user.avatar_url || getGravatarURL(user.email)} /><AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback></Avatar>
                        <div>
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role === 'admin' ? t('admin_role') : t('user_role')}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={hasMfa ? 'default' : 'outline'} className={hasMfa ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}>
                        {hasMfa ? t('mfa_enabled') : t('mfa_disabled')}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(user.updated_at), 'PP', { locale: currentLocale })}</TableCell>
                    <TableCell className="text-right">
                      {isCurrentUser ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0}>
                              <Button variant="ghost" size="icon" disabled>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('cannot_edit_self_tooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/users/${user.id}/edit`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                <span>{t('edit')}</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger><Shield className="mr-2 h-4 w-4" /><span>{t('role')}</span></DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}><Shield className="mr-2 h-4 w-4" />{t('admin_role')}</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'user')}><User className="mr-2 h-4 w-4" />{t('user_role')}</DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem onClick={() => confirmDisableMfa(user)} disabled={!hasMfa}>
                              <ShieldOff className="mr-2 h-4 w-4" />
                              <span>{t('disable_mfa')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => confirmDelete(user)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /><span>{t('delete')}</span></DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle><AlertDialogDescription>{t('confirm_delete_user', { email: userToDelete?.email })}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setUserToDelete(null)}>{t('cancel')}</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{t('delete')}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isMfaDialogOpen} onOpenChange={setIsMfaDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t('confirm_disable_mfa_title')}</AlertDialogTitle><AlertDialogDescription>{t('confirm_disable_mfa_desc', { email: userToEditMfa?.email })}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setUserToEditMfa(null)}>{t('cancel')}</AlertDialogCancel><AlertDialogAction onClick={handleDisableMfa} className={buttonVariants({ variant: "destructive" })}>{t('disable_mfa')}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default UserManager;