import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Bell, CheckCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Notifications = () => {
  const { t, i18n } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    // Note: Navigation will be handled by the Link component.
    // We just mark as read.
  };

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="p-2 font-bold">{t('notifications')}</div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          {loading ? (
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4">
              <p className="text-muted-foreground">{t('no_notifications')}</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notif) => (
                <DropdownMenuItem key={notif.id} asChild>
                  <Link
                    to={`/media/tv/${notif.media_tmdb_id}`}
                    onClick={() => handleNotificationClick(notif.id)}
                    className={`block rounded-lg p-3 transition-colors ${
                      !notif.is_read ? 'bg-muted/50 hover:bg-muted' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {notif.media_poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${notif.media_poster_path}`}
                          alt={notif.media_title ?? undefined}
                          className="h-16 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-16 w-12 rounded-md bg-muted" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">
                          {t(`notification_${notif.notification_type}`, { title: notif.media_title })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: currentLocale })}
                        </p>
                      </div>
                      {!notif.is_read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0} className="w-full">
                <CheckCheck className="mr-2 h-4 w-4" />
                {t('mark_all_as_read')}
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};