import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useJellyfinSettings } from '@/hooks/useJellyfinSettings';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';

const jellyfinSettingsSchema = z.object({
  url: z.string().url({ message: "Veuillez entrer une URL valide." }).optional().or(z.literal('')),
  api_key: z.string().optional().or(z.literal('')),
});

const JellyfinSettings = () => {
  const { settings, loading, saveSettings } = useJellyfinSettings();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof jellyfinSettingsSchema>>({
    resolver: zodResolver(jellyfinSettingsSchema),
    values: {
      url: settings.url || '',
      api_key: settings.api_key || '',
    },
    disabled: loading,
  });

  const onSubmit = async (values: z.infer<typeof jellyfinSettingsSchema>) => {
    await saveSettings({
      url: values.url ?? '',
      api_key: values.api_key ?? '',
    });
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save_jellyfin_settings')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default JellyfinSettings;