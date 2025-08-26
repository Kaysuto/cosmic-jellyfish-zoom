import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { getGravatarURL } from '@/lib/gravatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, CheckCheck, CheckCircle2, Trash2, X, Clock, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Notifications = () => {
  const { t, i18n } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  // Helper function to determine media type
  const getMediaType = (notification: any) => {
    // Use the media_type from the notification if available
    if (notification.media_type) {
      return notification.media_type;
    }
    // Fallback: for media requests, default to movie, otherwise tv
    return notification.notification_type === 'media_request' ? 'movie' : 'tv';
  };

  // Helper function to clean notification title
  const getCleanTitle = (notification: any) => {
    let title = notification.media_title || '';
    // Remove "Nouvelle demande:" prefix if it exists
    if (title.startsWith('Nouvelle demande: ')) {
      title = title.replace('Nouvelle demande: ', '');
    }
    return title;
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">{t('notifications')}</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} {unreadCount === 1 ? t('unread') : t('unread_plural')}
                  </Badge>
                )}
              </div>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="h-8 px-2 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Content */}
            <ScrollArea className="h-80">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="h-12 w-8 rounded-md bg-muted flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted" />
                        <div className="h-3 w-1/4 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">{t('no_notifications')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('no_notifications_desc')}</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {notifications.map((notif) => (
                    <Card
                      key={notif.id}
                      className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md ${
                        !notif.is_read 
                          ? 'bg-blue-50/50 border-blue-200/50 dark:bg-blue-950/20 dark:border-blue-800/30' 
                          : 'bg-card hover:bg-muted/30'
                      }`}
                    >
                      <CardContent className="p-3">
                        <Link
                          to={`/media/${getMediaType(notif)}/${notif.media_tmdb_id}`}
                          onClick={() => handleNotificationClick(notif.id)}
                          className="block"
                        >
                          <div className="flex items-start gap-3">
                            {/* Poster */}
                            <div className="relative flex-shrink-0">
                              {notif.media_poster_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w92${notif.media_poster_path}`}
                                  alt={notif.media_title ?? undefined}
                                  className="h-16 w-12 rounded-md object-cover shadow-sm"
                                />
                              ) : (
                                <div className="h-16 w-12 rounded-md bg-muted flex items-center justify-center">
                                  <Bell className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              {!notif.is_read && (
                                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white dark:border-background" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                                                 <p className="text-sm font-medium leading-tight line-clamp-2">
                                   {t(`notification_${notif.notification_type}`, { title: getCleanTitle(notif) })}
                                 </p>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!notif.is_read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsRead(notif.id); }}
                                      title={t('mark_as_read')}
                                    >
                                      <CheckCircle2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                                    onClick={(e) => handleDeleteNotification(e, notif.id)}
                                    title={t('delete_notification')}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Requester info */}
                              {notif.requester && (
                                <div className="flex items-center gap-2 mb-1">
                                  <img
                                    src={notif.requester.avatar_url || getGravatarURL(notif.requester.email, 40)}
                                    className="h-4 w-4 rounded-full object-cover border border-border"
                                    alt="avatar"
                                  />
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {t('requested_by')} {notif.requester.first_name} {notif.requester.last_name}
                                  </span>
                                </div>
                              )}

                              {/* Time */}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: currentLocale })}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t bg-muted/30 p-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="w-full"
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  {t('mark_all_as_read')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};