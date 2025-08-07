import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface AppSetting {
  key: string;
  value: string;
}

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('app_settings').select('*');
    if (error) {
      console.error('Error fetching app settings:', error);
      setSettings([]);
    } else {
      setSettings(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();

    const channel: RealtimeChannel = supabase
      .channel('app-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_settings',
        },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  const getSetting = (key: string, defaultValue = ''): string => {
    return settings.find(s => s.key === key)?.value || defaultValue;
  };

  return { settings, loading, getSetting, refreshSettings: fetchSettings };
};