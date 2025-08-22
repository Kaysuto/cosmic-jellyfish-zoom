import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Film } from 'lucide-react';

const jellyfinSettingsSchema = z.object({
  url: z.string().url({ message: "Veuillez entrer une URL valide." }),
  api_key: z.string().min(1, { message: "La clé API est requise." }),
});

const JellyfinSettings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof jellyfinSettingsSchema>>({
    resolver: zodResolver(jellyfinSettingsSchema),
    defaultValues: {
      url: '',
      api_key: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('jellyfin_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
        showError(t('error_loading_jellyfin_settings'));
        console.error(error);
      } else if (data) {
        form.reset({
          url: data.url || '',
          api_key: data.api_key || '',
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, [form, t]);

  const onSubmit = async (values: z.infer<typeof jellyfinSettingsSchema>) => {
    const { error } = await supabase
      .from('jellyfin_settings')
      .upsert({ id: 1, ...values, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    if (error) {
      showError(t('error_saving_settings'));
    } else {
      showSuccess(t('settings_saved_successfully'));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          {t('jellyfin_settings')}
        </CardTitle>
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
                    <Input {...field} placeholder={t('jellyfin_url_placeholder')} />
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
                    <Input type="password" {...field} placeholder={t('jellyfin_api_key_placeholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? t('saving') : t('save_jellyfin_settings')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default JellyfinSettings;