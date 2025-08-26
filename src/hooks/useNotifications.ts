import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { useProfile } from './useProfile';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);

    const { data, error } = await supabase.functions.invoke('get-notifications', {
      body: { userId: session.user.id }
    });

    if (error) {
      showError('Failed to fetch notifications.');
      console.error(error);
    } else {
      // Deduplicate by id first
      const byId = new Map<string, Notification>();
      (data as Notification[]).forEach((n) => byId.set(n.id, n));

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
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;

    fetchNotifications();

    const channel = supabase
      .channel('public-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, fetchNotifications)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notifications' }, fetchNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [session?.user?.id, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    const userId = session?.user?.id;
    console.log('Marking as read:', { notificationId, userId });
    
    // Try direct Supabase update first
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('recipient_id', userId);

    if (error) {
      console.error('Mark as read error:', error);
      showError('Failed to mark notification as read.');
    } else {
      setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n)));
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const userId = session?.user?.id;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)
      .eq('recipient_id', userId);

    if (error) {
      showError('Failed to mark all notifications as read.');
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const userId = session?.user?.id;
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('recipient_id', userId);

    if (error) {
      console.error('Delete notification error:', error);
      showError('Failed to delete notification.');
    } else {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const deletedNotification = notifications.find(n => n.id === notificationId);
        return deletedNotification && !deletedNotification.is_read ? Math.max(0, prev - 1) : prev;
      });
      showSuccess('Notification deleted.');
    }
  };

  const clearAllNotifications = async () => {
    const userId = session?.user?.id;
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('recipient_id', userId);

    if (error) {
      console.error('Clear all notifications error:', error);
      showError('Failed to clear all notifications.');
    } else {
      setNotifications([]);
      setUnreadCount(0);
      showSuccess('All notifications cleared.');
    }
  };

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, refetch: fetchNotifications };
};