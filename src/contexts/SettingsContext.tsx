import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface AppSetting {
  key: string;
  value: string;
}

interface SettingsContextType {
  settings: AppSetting[];
  loading: boolean;
  getSetting: (key: string, defaultValue?: string) => string;
  refreshSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: [],
  loading: true,
  getSetting: () => '',
  refreshSettings: () => {},
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    console.log('Fetching app settings...');
    const { data, error } = await supabase.from('app_settings').select('*');
    if (error) {
      console.error('Error fetching app settings:', error);
      setSettings([]);
    } else {
      console.log('App settings fetched:', data);
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
        (payload) => {
          console.log('Realtime update for app_settings received:', payload);
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  const getSetting = useCallback((key: string, defaultValue: string = ''): string => {
    return settings.find(s => s.key === key)?.value || defaultValue;
  }, [settings]);

  const value = { settings, loading, getSetting, refreshSettings: fetchSettings };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};