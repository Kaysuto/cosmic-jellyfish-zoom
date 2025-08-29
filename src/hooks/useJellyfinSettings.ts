import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export interface JellyfinSettings {
  url: string;
  api_key: string;
}

export const useJellyfinSettings = () => {
  const [settings, setSettings] = useState<JellyfinSettings>({ url: '', api_key: '' });
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Utiliser la fonction Edge pour récupérer les paramètres
      const { data, error } = await supabase.functions.invoke('get-jellyfin-settings');

      if (error) {
        console.error('Error loading Jellyfin settings:', error);
        return;
      }

      if (data && data.settings) {
        setSettings({
          url: data.settings.url || '',
          api_key: data.settings.api_key || ''
        });
        setTableExists(data.exists || false);
      }
    } catch (error: any) {
      console.error('Error loading Jellyfin settings:', error);
      // Ne pas afficher de toast ici pour éviter les erreurs d'initialisation
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (newSettings: JellyfinSettings) => {
    if (!tableExists) {
      showError('La table jellyfin_settings n\'existe pas encore. Veuillez appliquer les migrations.');
      return;
    }

    setLoading(true);
    try {
      // Utiliser la fonction Edge setup-jellyfin-settings pour sauvegarder
      const { error } = await supabase.functions.invoke('setup-jellyfin-settings', {
        body: {
          url: newSettings.url,
          api_key: newSettings.api_key
        }
      });

      if (error) throw error;

      setSettings(newSettings);
      showSuccess('Paramètres sauvegardés avec succès');
    } catch (error: any) {
      showError('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, saveSettings, fetchSettings, tableExists };
};