import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

export interface JellyfinSettings {
  url: string;
  api_key: string;
}

export const useJellyfinSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<JellyfinSettings>({ url: '', api_key: '' });
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['jellyfin_url', 'jellyfin_api_key']);

      if (error) throw error;

      const newSettings: Partial<JellyfinSettings> = {};
      data.forEach(item => {
        if (item.key === 'jellyfin_url') newSettings.url = item.value;
        if (item.key === 'jellyfin_api_key') newSettings.api_key = item.value;
      });
      setSettings(current => ({ ...current, ...newSettings }));
    } catch (error: any) {
      showError(t('error_loading_jellyfin_settings'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (newSettings: JellyfinSettings) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('settings').upsert([
        { key: 'jellyfin_url', value: newSettings.url },
        { key: 'jellyfin_api_key', value: newSettings.api_key },
      ], { onConflict: 'key' });

      if (error) throw error;

      setSettings(newSettings);
      showSuccess(t('settings_saved_successfully'));
    } catch (error: any) {
      showError(t('error_saving_settings'));
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, saveSettings, fetchSettings };
};