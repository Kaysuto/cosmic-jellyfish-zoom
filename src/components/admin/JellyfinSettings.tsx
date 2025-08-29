import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useJellyfinSettings } from '@/hooks/useJellyfinSettings';
import { useJellyfin } from '@/hooks/useJellyfin';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, RefreshCw, Key, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

const jellyfinSettingsSchema = z.object({
  url: z.string().url({ message: "Veuillez entrer une URL valide." }).optional().or(z.literal('')),
  api_key: z.string().optional().or(z.literal('')),
  admin_username: z.string().optional().or(z.literal('')),
  admin_password: z.string().optional().or(z.literal('')),
});

const JellyfinSettings = () => {
  const { settings, loading, saveSettings } = useJellyfinSettings();
  const { syncWithJellyfin, isSyncing } = useJellyfin();
  const { t } = useSafeTranslation();
  const [secretsLoading, setSecretsLoading] = React.useState(false);
  const [secrets, setSecrets] = React.useState<{ admin_username: string; masked_password: string } | null>(null);

  const form = useForm<z.infer<typeof jellyfinSettingsSchema>>({
    resolver: zodResolver(jellyfinSettingsSchema),
    values: {
      url: settings.url || '',
      api_key: settings.api_key || '',
      admin_username: '',
      admin_password: '',
    },
    disabled: loading,
  });

  const onSubmit = async (values: z.infer<typeof jellyfinSettingsSchema>) => {
    await saveSettings({
      url: values.url ?? '',
      api_key: values.api_key ?? '',
    });
  };

  const handleSyncServer = async () => {
    await syncWithJellyfin();
  };

  React.useEffect(() => {
    const fetchSecrets = async () => {
      try {
        setSecretsLoading(true);
        const { data } = await supabase.functions.invoke('jellyfin-secrets', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: {},
        } as any);
        if (data?.success) {
          setSecrets({
            admin_username: data.secrets?.admin_username || '',
            masked_password: data.secrets?.admin_password || '***',
          });
        }
      } finally {
        setSecretsLoading(false);
      }
    };
    fetchSecrets();
  }, []);

  const handleUpdateSecrets = async () => {
    const values = form.getValues();
    if (!values.url || !values.api_key) return;
    try {
      setSecretsLoading(true);
      const { data } = await supabase.functions.invoke('jellyfin-secrets', {
        method: 'POST',
        body: {
          url: values.url,
          api_key: values.api_key,
          admin_username: values.admin_username,
          admin_password: values.admin_password,
        },
      } as any);
      if (data?.success) {
        setSecrets({
          admin_username: values.admin_username || secrets?.admin_username || '',
          masked_password: '***',
        });
      }
    } finally {
      setSecretsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    const values = form.getValues();
    if (!values.url || !values.api_key) return;
    try {
      setSecretsLoading(true);
      await supabase.functions.invoke('jellyfin-secrets', {
        method: 'PUT',
        body: { url: values.url, api_key: values.api_key },
      } as any);
    } finally {
      setSecretsLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('jellyfin_settings')}</CardTitle>
        <CardDescription>{t('jellyfin_settings_desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('jellyfin_url')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('jellyfin_url_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('jellyfin_api_key')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={t('jellyfin_api_key_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="admin_username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Shield className="h-4 w-4" />{t('jellyfin_admin_username')}</FormLabel>
                    <FormControl>
                      <Input placeholder={secrets?.admin_username || 'Kimiya'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="admin_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Key className="h-4 w-4" />{t('jellyfin_admin_password')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={secrets?.masked_password || '***'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('save_jellyfin_settings')}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSyncServer} 
                disabled={isSyncing || !settings.url || !settings.api_key}
              >
                {isSyncing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                {t('sync_jellyfin_server')}
              </Button>
              <Button type="button" variant="outline" onClick={handleTestConnection} disabled={secretsLoading}>
                {secretsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('test_connection')}
              </Button>
              <Button type="button" onClick={handleUpdateSecrets} disabled={secretsLoading}>
                {secretsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('save_admin_credentials')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default JellyfinSettings;