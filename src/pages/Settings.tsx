import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Languages } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/hooks/useProfile';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { profile } = useProfile();
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingSettings(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'allow_registrations')
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        showError(t('error_loading_settings'));
      } else if (data) {
        setAllowRegistrations(data.value === 'true');
      }
      setLoadingSettings(false);
    };
    fetchSettings();
  }, [t]);

  const handleRegistrationToggle = async (checked: boolean) => {
    const originalState = allowRegistrations;
    setAllowRegistrations(checked);
    const { error } = await supabase
      .from('app_settings')
      .update({ value: checked.toString() })
      .eq('key', 'allow_registrations');

    if (error) {
      showError(t('error_updating_setting'));
      setAllowRegistrations(originalState);
    } else {
      showSuccess(t(checked ? 'registrations_enabled' : 'registrations_disabled'));
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
          <p className="text-muted-foreground">
            {t('settings_description')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {t('language_settings')}
            </CardTitle>
            <CardDescription>{t('select_language_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-xs">
              <Select value={i18n.language} onValueChange={changeLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {profile?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('registration_settings')}
              </CardTitle>
              <CardDescription>{t('allow_new_registrations_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSettings ? (
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-10 rounded-full" />
                  <Skeleton className="h-5 w-48" />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-registrations"
                    checked={allowRegistrations}
                    onCheckedChange={handleRegistrationToggle}
                  />
                  <Label htmlFor="allow-registrations">{t('allow_new_registrations')}</Label>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Settings;