import { useLogs } from '@/hooks/useLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { useUsers } from '@/hooks/useUsers';

const RecentActivity = () => {
  const { logs, loading } = useLogs();
  const { users, loading: usersLoading } = useUsers();
  const { t } = useSafeTranslation();

  if (loading || usersLoading) {
    return <Skeleton className="h-[300px]" />;
  }

  const recentLogs = logs.slice(0, 5);
  const userMap = new Map(users.map(u => [u.id, u]));

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('audit_logs')}</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentLogs.map(log => {
            const user = log.user_id ? userMap.get(log.user_id) : null;
            const userName = user ? `${user.first_name} ${user.last_name}` : t('system');
            const actionText = t(log.action, log.details || {});
            return (
              <div key={log.id} className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{String(actionText)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;