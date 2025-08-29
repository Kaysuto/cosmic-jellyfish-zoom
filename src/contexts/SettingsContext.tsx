import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { AppSetting } from '@/types/supabase';

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
    try {
      // Essayer d'abord app_settings, puis settings comme fallback
      let { data, error } = await supabase.from('app_settings').select('*');
      
      if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
        // Si app_settings n'existe pas, essayer settings
        const result = await supabase.from('settings').select('*');
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        console.error('Error fetching app settings:', error);
        setSettings([]);
      } else {
        setSettings(data || []);
      }
    } catch (err) {
      console.error('Exception in fetchSettings:', err);
      setSettings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    
    try {
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
            fetchSettings();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'settings',
          },
          (payload) => {
            fetchSettings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
    }
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