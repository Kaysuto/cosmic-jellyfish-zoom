import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Settings as SettingsIcon, Link as LinkIcon, Copy } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/contexts/SettingsContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSession } from '@/contexts/AuthContext';

const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const { profile } = useProfile();
  const { getSetting, refreshSettings, loading: settingsLoading } = useSettings();
  
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<z.infer<typeof generalSettingsSchema> | null>(null);

  const webhookUrl = `https://tgffkwoekuaetahrwioo.supabase.co/functions/v1/media-sync?secret=VOTRE_SECRET_ICI`;

  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(successMessage);
  };

  const generalSettingsSchema = useMemo(() => z.object({
    site_title: z.string().min(1, { message: t('site_title_empty_error') }),
    default_language: z.enum(['fr', 'en']),
  }), [t]);

  const form = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: { site_title: '', default_language: 'fr' },
  });

  useEffect(() => {
    if (!settingsLoading) {
      const regValue = getSetting('allow_registrations', 'true');
      setAllowRegistrations(regValue === 'true');
      setLoadingRegistrations(false);

      form.reset({
        site_title: getSetting('site_title', 'Statut des Services Jelly'),
        default_language: getSetting('default_language', 'fr') as 'fr' | 'en',
      });
    }
  }, [settingsLoading, getSetting, form]);

  const handleRegistrationToggle = async (checked: boolean) => {
    if (!session?.user) return;
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
      await supabase.from('audit_logs').insert({ user_id: session.user.id, action: 'setting_updated', details: { key: 'allow_registrations', value: checked.toString() } });
      refreshSettings();
    }
  };

  const handleGeneralSettingsSubmit = (values: z.infer<typeof generalSettingsSchema>) => {
    setPendingSettings(values);
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingSettings || !session?.user) return;

    const settingsToUpdate = [
      { key: 'site_title', value: pendingSettings.site_title },
      { key: 'default_language', value: pendingSettings.default_language },
    ];

    const { error } = await supabase.from('app_settings').upsert(settingsToUpdate, { onConflict: 'key' });

    if (error) {
      showError(t('error_updating_setting'));
    } else {
      showSuccess(t('settings_updated_successfully'));
      for (const setting of settingsToUpdate) {
        await supabase.from('audit_logs').insert({ user_id: session.user.id, action: 'setting_updated', details: setting });
      }
      refreshSettings();
    }
    setIsConfirmOpen(false);
    setPendingSettings(null);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
            <p className="text-muted-foreground">{t('settings_description')}</p>
          </div>

          {profile?.role === 'admin' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5" />{t('general_settings')}</CardTitle>
                  <CardDescription>{t('general_settings_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {settingsLoading ? <Skeleton className="h-48 w-full" /> : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleGeneralSettingsSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="site_title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('site_title_label')}</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="default_language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('default_language')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="fr">Français</SelectItem>
                                  <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>{t('default_language_desc')}</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>{t('save_changes')}</Button>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5" />{t('integrations')}</CardTitle>
                  <CardDescription>{t('integrations_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="webhook-url">{t('webhook_url_label')}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input id="webhook-url" readOnly value={webhookUrl} className="font-mono text-xs" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl, t('url_copied_to_clipboard'))}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{t('webhook_url_desc')}</p>
                  </div>
                  <div className="border-t pt-4">
                    <Label>{t('webhook_headers_label')}</Label>
                    <p className="text-xs text-muted-foreground mb-2">{t('webhook_headers_desc')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <Input readOnly value="apikey" className="font-mono text-xs" />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">Value</Label>
                        <div className="flex items-center gap-2">
                          <Input readOnly value={ANON_KEY} className="font-mono text-xs" />
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(ANON_KEY, t('api_key_copied'))}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_global_changes_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_global_changes_desc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingSettings(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>{t('save_changes')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Settings;