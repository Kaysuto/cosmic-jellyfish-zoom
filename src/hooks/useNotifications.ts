import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError } from '@/utils/toast';
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
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;

    fetchNotifications();

    const channel = supabase
      .channel('public-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          fetchNotifications();
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [session, profile, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase.functions.invoke('mark-notifications-read', {
      body: { ids: [notificationId] }
    });

    if (error) {
      showError('Failed to mark notification as read.');
    } else {
      setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n)));
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