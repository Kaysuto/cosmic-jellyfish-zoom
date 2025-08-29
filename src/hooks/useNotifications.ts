import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { useProfile } from './useProfile';
import { useSafeTranslation } from './useSafeTranslation';

export interface Notification {
  id: string;
  created_at: string;
  notification_type: string;
  media_tmdb_id: number | null;
  media_title: string | null;
  media_poster_path: string | null;
  is_read: boolean;
  recipient_id: string | null;
  media_type?: string;
  requester?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
}

export const useNotifications = () => {
  const { session } = useSession();
  const { profile } = useProfile();
  const { t } = useSafeTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    // Vérifications de sécurité
    if (!session?.user?.id) {
      console.log('No user session, skipping notifications fetch');
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (!session?.access_token) {
      console.log('No access token, skipping notifications fetch');
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('get-notifications', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error fetching notifications:', error);
        // Si c'est une erreur 401, l'utilisateur n'est probablement pas connecté
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.log('User not authenticated, clearing notifications');
          setNotifications([]);
          setUnreadCount(0);
        } else {
          // Pour les autres erreurs, on garde les notifications existantes
          console.log('Keeping existing notifications due to error');
        }
        return;
      }

      if (data) {
        // S'assurer que data est un tableau
        const notificationsArray = Array.isArray(data) ? data : [];
        
        // Deduplicate by id first
        const byId = new Map<string, Notification>();
        notificationsArray.forEach((n) => byId.set(n.id, n));

        // Further collapse duplicates of same (type + tmdb_id), keep latest
        const byComposite = new Map<string, Notification>();
        Array.from(byId.values()).forEach((n) => {
          const key = `${n.notification_type}:${n.media_tmdb_id ?? 'null'}`;
          const existing = byComposite.get(key);
          if (!existing) {
            byComposite.set(key, n);
          } else {
            if (new Date(n.created_at).getTime() > new Date(existing.created_at).getTime()) {
              byComposite.set(key, n);
            }
          }
        });

        // Sort by created_at desc and limit to 20
        const normalized = Array.from(byComposite.values())
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 20);

        setNotifications(normalized);
        setUnreadCount(normalized.filter((n: Notification) => !n.is_read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      // En cas d'erreur, on garde les notifications existantes
      console.log('Keeping existing notifications due to exception');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    // Ne pas appeler fetchNotifications si pas de session
    if (!session?.user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    // Désactiver temporairement les abonnements en temps réel pour éviter les appels répétés
    // const channel = supabase
    //   .channel('public-notifications')
    //   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, fetchNotifications)
    //   .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notifications' }, fetchNotifications)
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(channel);
    // };

  }, [session?.user?.id, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    const userId = session?.user?.id;
    if (!userId) return;
    
    // Trouver la notification à marquer comme lue
    const notificationToUpdate = notifications.find(n => n.id === notificationId);
    if (!notificationToUpdate) return;
    
    // Mettre à jour l'état local immédiatement
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    ));
    
    // Mettre à jour le compteur de notifications non lues
    if (!notificationToUpdate.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    // Appeler la fonction Edge pour mettre à jour la base de données
    const { data, error } = await supabase.functions.invoke('manage-notifications', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: {
        action: 'mark_as_read',
        notificationId: notificationId
      }
    });

    if (error) {
      console.error('Error marking notification as read:', error);
      // En cas d'erreur, remettre la notification dans l'état non lue
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: false } : n
      ));
      if (!notificationToUpdate.is_read) {
        setUnreadCount(prev => prev + 1);
      }
      showError('Failed to mark notification as read.');
    }
  };

  const markAllAsRead = async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    const unreadNotifications = notifications.filter(n => !n.is_read);
    if (unreadNotifications.length === 0) return;

    const unreadIds = unreadNotifications.map(n => n.id);

    // Mettre à jour l'état local immédiatement
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    // Appeler la fonction Edge pour mettre à jour la base de données
    const { data, error } = await supabase.functions.invoke('manage-notifications', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: {
        action: 'mark_all_as_read',
        notificationIds: unreadIds
      }
    });

    if (error) {
      console.error('Error marking all notifications as read:', error);
      // En cas d'erreur, remettre l'état précédent
      setNotifications(prev => prev.map(n => 
        unreadIds.includes(n.id) ? { ...n, is_read: false } : n
      ));
      setUnreadCount(unreadNotifications.length);
      showError(t('mark_all_read_error'));
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const userId = session?.user?.id;
    if (!userId) return;
    
    // Supprimer de l'état local immédiatement
    const deletedNotification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      return deletedNotification && !deletedNotification.is_read ? Math.max(0, prev - 1) : prev;
    });
    
    // Appeler la fonction Edge pour supprimer de la base de données
    const { data, error } = await supabase.functions.invoke('manage-notifications', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: {
        action: 'delete',
        notificationId: notificationId
      }
    });

    if (error) {
      console.error('Delete notification error:', error);
      // En cas d'erreur, remettre la notification dans l'état
      if (deletedNotification) {
        setNotifications(prev => [...prev, deletedNotification]);
        if (!deletedNotification.is_read) {
          setUnreadCount(prev => prev + 1);
        }
      }
      showError(t('notification_deleted_error'));
    } else {
      showSuccess(t('notification_deleted'));
      // Rafraîchir les notifications pour s'assurer de la synchronisation
      await fetchNotifications();
    }
  };

  const clearAllNotifications = async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    
    // Vider l'état local immédiatement
    setNotifications([]);
    setUnreadCount(0);
    
    // Appeler la fonction Edge pour vider la base de données
    const { data, error } = await supabase.functions.invoke('manage-notifications', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: {
        action: 'clear_all'
      }
    });

    if (error) {
      console.error('Clear all notifications error:', error);
      showError('Failed to clear all notifications.');
    } else {
      showSuccess('All notifications cleared.');
      // Rafraîchir les notifications pour s'assurer de la synchronisation
      await fetchNotifications();
    }
  };

  const refreshNotifications = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-notifications', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error refreshing notifications:', error);
        return;
      }

      if (data) {
        const notificationsArray = Array.isArray(data) ? data : [];
        setNotifications(notificationsArray);
        setUnreadCount(notificationsArray.filter((n: Notification) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error in refreshNotifications:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  return { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications, 
    refetch: fetchNotifications,
    refresh: refreshNotifications 
  };
};