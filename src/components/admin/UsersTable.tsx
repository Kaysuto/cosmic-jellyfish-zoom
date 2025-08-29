import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Profile } from '@/types/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit, RefreshCw, Link as LinkIcon, Shield, ShieldOff, Monitor, Link, Link2Off } from 'lucide-react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { getGravatarURL } from '@/lib/gravatar';

interface UsersTableProps {
  users: Profile[];
  loading: boolean;
  onEdit: (user: Profile) => void;
  onRefresh: () => void;
  onSync: (userId: string) => void;
  jellyfinStatus: 'connected' | 'disconnected' | 'loading';
}

const UsersTable = ({ users, loading, onEdit, onRefresh, onSync, jellyfinStatus }: UsersTableProps) => {
  const { t } = useSafeTranslation();

  // Debug logs
  console.log('🔍 UsersTable - Props reçues:', {
    usersCount: users?.length || 0,
    loading,
    users: users,
    jellyfinStatus
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('user')}</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>{t('role')}</TableHead>
            <TableHead>MFA</TableHead>
            <TableHead>Jellyfin</TableHead>
            <TableHead>{t('member_since')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">{t('loading')}...</TableCell>
            </TableRow>
          ) : !users || users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                {t('no_users')} (Debug: users.length = {users?.length || 'undefined'})
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => {
              console.log('👤 Rendu utilisateur:', user);
              const isJellyfinMapped = !!(user.jellyfin_user_id || user.jellyfin_username);
              
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={getGravatarURL(user.email, 40)} />
                      <AvatarFallback>
                        {getInitials(`${user.first_name || ''} ${user.last_name || ''}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.first_name || 'N/A'} {user.last_name || 'N/A'}</span>
                      <span className="text-sm text-muted-foreground">ID: {user.id.substring(0, 8)}...</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.email || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {t(user.role === 'admin' ? 'admin_role' : 'user_role')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {user.has_mfa ? (
                        <>
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Activé</span>
                        </>
                      ) : (
                        <>
                          <ShieldOff className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Non activé</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {isJellyfinMapped ? (
                        <>
                          <Link className="h-4 w-4 text-green-500" />
                          <div className="flex flex-col">
                            <span className="text-sm text-green-600 font-medium">
                              {user.jellyfin_username || 'Mappé'}
                            </span>
                            {user.is_administrator && (
                              <span className="text-xs text-muted-foreground">Admin</span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <Link2Off className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Non mappé</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.updated_at ? 
                      format(new Date(user.updated_at), 'd MMM yyyy', { locale: fr }) : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onSync(user.id)} disabled={jellyfinStatus !== 'connected'}>
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;