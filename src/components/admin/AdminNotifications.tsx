import { useState, useEffect, useCallback, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertTriangle, CheckCircle, Info, Clock, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
}

const STORAGE_KEY = 'admin-notifications';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mémoriser la fonction d'initialisation
  const initializeDefaultNotifications = useCallback(() => {
    const defaultNotifications: Notification[] = [
      {
        id: '1',
        title: 'Nouvel incident détecté',
        message: 'Le service Jellyfin a rencontré un problème de connectivité',
        type: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false
      },
      {
        id: '2',
        title: 'Maintenance planifiée',
        message: 'Une maintenance est prévue pour demain à 2h du matin',
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false
      },
      {
        id: '3',
        title: 'Service restauré',
        message: 'Le service de base de données est maintenant opérationnel',
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true
      }
    ];
    setNotifications(defaultNotifications);
    saveNotificationsToStorage(defaultNotifications);
  }, []);

  // Mémoriser la fonction de sauvegarde
  const saveNotificationsToStorage = useCallback((notificationsToSave: Notification[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notificationsToSave));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
    }
  }, []);

  // Mémoriser la fonction de mise à jour
  const updateNotifications = useCallback((newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    saveNotificationsToStorage(newNotifications);
  }, [saveNotificationsToStorage]);

  // Charger les notifications depuis localStorage au montage
  useEffect(() => {
    const savedNotifications = localStorage.getItem(STORAGE_KEY);
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Convertir les timestamps string en objets Date
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        // En cas d'erreur, initialiser avec des notifications par défaut
        initializeDefaultNotifications();
      }
    } else {
      // Première visite, initialiser avec des notifications par défaut
      initializeDefaultNotifications();
    }
  }, [initializeDefaultNotifications]);

  // Mémoriser le nombre de notifications non lues
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  // Mémoriser les fonctions de gestion des notifications
  // const markAsRead = useCallback((id: string) => {
  //   const updatedNotifications = notifications.map(n => 
  //     n.id === id ? { ...n, read: true } : n
  //   );
  //   updateNotifications(updatedNotifications);
  // }, [notifications, updateNotifications]);

  const markAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    updateNotifications(updatedNotifications);
  }, [notifications, updateNotifications]);

  const removeNotification = useCallback((id: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    updateNotifications(updatedNotifications);
  }, [notifications, updateNotifications]);

  const clearAllNotifications = useCallback(() => {
    updateNotifications([]);
  }, [updateNotifications]);

  // Mémoriser les fonctions utilitaires
  const getNotificationIcon = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  }, []);


  const formatTimestamp = useCallback((timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return timestamp.toLocaleDateString('fr-FR');
  }, []);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-6 px-2 text-xs"
                  >
                    Tout marquer comme lu
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="h-6 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            {/* Content */}
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="h-5 w-5 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md ${
                        !notification.read 
                          ? 'bg-blue-50/50 border-blue-200/50 dark:bg-blue-950/20 dark:border-blue-800/30' 
                          : 'bg-card hover:bg-muted/30'
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className={cn(
                                "text-sm font-medium line-clamp-1",
                                !notification.read && "font-semibold"
                              )}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(notification.timestamp)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminNotifications;
