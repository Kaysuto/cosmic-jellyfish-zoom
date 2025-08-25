import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError } from '@/utils/toast';

export interface Notification {
  id: string;
  created_at: string;
  notification_type: 'request_approved' | 'request_rejected';
  media_tmdb_id: number;
  media_title: string;
  media_poster_path: string | null;
  is_read: boolean;
}

export const useNotifications = () => {
  const { session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('get-notifications');
    
    if (error) {
      showError('Failed to fetch notifications.');
    } else {
      setNotifications(data || []);
      const unread = (data || []).filter((n: Notification) => !n.is_read).length;
      setUnreadCount(unread);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${session?.user.id}` },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase.functions.invoke('mark-notifications-read', {
      body: { ids: [notificationId] }
    });
    if (error) {
      showError('Failed to mark notification as read.');
    } else {
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase.functions.invoke('mark-notifications-read', {
      body: { ids: unreadIds }
    });
    if (error) {
      showError('Failed to mark all notifications as read.');
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
};