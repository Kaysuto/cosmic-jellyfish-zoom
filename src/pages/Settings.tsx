import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Languages, PenSquare } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/hooks/useProfile';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { profile } = useProfile();
  const { getSetting, refreshSettings, loading: settingsLoading } = useAppSettings();
  
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);

  const titleSchema = useMemo(() => z.object({
    site_title: z.string().min(1, { message: t('site_title_empty_error') }),
  }), [t]);

  const titleForm = useForm<z.infer<typeof titleSchema>>({
    resolver: zodResolver(titleSchema),
    defaultValues: { site_title: '' },
  });

  useEffect(() => {
    const fetchRegistrationSetting = async () => {
      setLoadingRegistrations(true);
      const regValue = getSetting('allow_registrations', 'true');
      setAllowRegistrations(regValue === 'true');
      setLoadingRegistrations(false);
    };

    const fetchTitleSetting = () => {
      const currentTitle = getSetting('site_title', 'Statut des Services Jelly');
      titleForm.setValue('site_title', currentTitle);
    };

    if (!settingsLoading) {
      fetchRegistrationSetting();
      fetchTitleSetting();
    }
  }, [settingsLoading, getSetting, titleForm]);

  const handleRegistrationToggle = async (checked: boolean) => {
    const originalState = allowRegistrations;
    setAllowRegistrations(checked);
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'allow_registrations', value: checked.toString() }, { onConflict: 'key' });

    if (error) {
      showError(t('error_updating_setting'));
      setAllowRegistrations(originalState);
    } else {
      showSuccess(t(checked ? 'registrations_enabled' : 'registrations_disabled'));
      refreshSettings();
    }
  };

  const handleTitleSubmit = async (values: z.infer<typeof titleSchema>) => {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'site_title', value: values.site_title }, { onConflict: 'key' });

    if (error) {
      showError(t('error_updating_site_title'));
    } else {
      showSuccess(t('site_title_updated'));
      refreshSettings();
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
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PenSquare className="h-5 w-5" />{t('site_title_settings')}</CardTitle>
                <CardDescription>{t('site_title_settings_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {settingsLoading ? <Skeleton className="h-24 w-full" /> : (
                  <Form {...titleForm}>
                    <form onSubmit={titleForm.handleSubmit(handleTitleSubmit)} className="space-y-4">
                      <FormField
                        control={titleForm.control}
                        name="site_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('site_title_label')}</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={titleForm.formState.isSubmitting}>{t('save')}</Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />{t('registration_settings')}</CardTitle>
                <CardDescription>{t('allow_new_registrations_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRegistrations ? (
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
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;