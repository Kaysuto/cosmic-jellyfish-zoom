import { useState, useEffect, useCallback, useRef } from 'react';
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

type RawNotificationRow = {
  id: string;
  created_at: string;
  type?: string;
  notification_type?: string;
  payload?: unknown;
  title?: string | null;
  is_read?: boolean;
  recipient_id?: string | null;
  target_role?: string | null;
};

const formatNotification = (n: RawNotificationRow): Notification => {
  let media_tmdb_id: number | null = null;
  let media_title: string | null = n.title ?? null;
  let media_poster_path: string | null = null;
  if (n.payload) {
    try {
      const pRecord = typeof n.payload === 'string' ? JSON.parse(n.payload) as Record<string, unknown> : (n.payload as Record<string, unknown>);
      const getProp = <T,>(obj: Record<string, unknown> | undefined, key: string): T | undefined =>
        obj && Object.prototype.hasOwnProperty.call(obj, key) ? (obj[key] as T) : undefined;
      media_tmdb_id = getProp<number>(pRecord, 'tmdb_id') ?? getProp<number>(pRecord, 'media_tmdb_id') ?? null;
      media_title = media_title ?? getProp<string>(pRecord, 'title') ?? getProp<string>(pRecord, 'media_title') ?? null;
      media_poster_path = getProp<string>(pRecord, 'poster_path') ?? getProp<string>(pRecord, 'media_poster_path') ?? null;
    } catch {
      // ignore
    }
  }
  return {
    id: n.id,
    created_at: n.created_at,
    notification_type: n.notification_type ?? n.type ?? 'unknown',
    media_tmdb_id,
    media_title,
    media_poster_path,
    is_read: !!n.is_read,
    recipient_id: n.recipient_id ?? null,
  };
};

export const useNotifications = () => {
  const { session } = useSession();
  const { profile } = useProfile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      showError('Failed to fetch notifications.');
    } else {
      const formatted = data.map(formatNotification);
      setNotifications(formatted);
      setUnreadCount(formatted.filter(n => !n.is_read).length);
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
          // Re-fetch all notifications on any change for simplicity and correctness
          fetchNotifications();
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [session, profile, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

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

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    if (error) {
      showError('Failed to mark all notifications as read.');
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
};