import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings as SettingsIcon } from 'lucide-react';
import { useSession } from '@/contexts/AuthContext';
import { AppSetting } from '@/contexts/SettingsContext';
import { useMemo, useEffect, useState } from 'react';
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

interface GeneralSettingsFormProps {
  settings: AppSetting[];
  loading: boolean;
  onUpdate: () => void;
}

const GeneralSettingsForm = ({ settings, loading, onUpdate }: GeneralSettingsFormProps) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<z.infer<typeof generalSettingsSchema> | null>(null);

  const generalSettingsSchema = useMemo(() => z.object({
    site_title: z.string().min(1, { message: t('site_title_empty_error') }),
    default_language: z.enum(['fr', 'en']),
  }), [t]);

  const form = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: { site_title: '', default_language: 'fr' },
  });

  useEffect(() => {
    if (!loading) {
      const getSetting = (key: string, defaultValue: string = '') => settings.find(s => s.key === key)?.value || defaultValue;
      form.reset({
        site_title: getSetting('site_title', 'Statut des Services Jelly'),
        default_language: getSetting('default_language', 'fr') as 'fr' | 'en',
      });
    }
  }, [loading, settings, form]);

  const handleFormSubmit = (values: z.infer<typeof generalSettingsSchema>) => {
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
      onUpdate();
    }
    setIsConfirmOpen(false);
    setPendingSettings(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5" />{t('general_settings')}</CardTitle>
          <CardDescription>{t('general_settings_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-48 w-full" /> : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <FormField control={form.control} name="site_title" render={({ field }) => (<FormItem><FormLabel>{t('site_title_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="default_language" render={({ field }) => (<FormItem><FormLabel>{t('default_language')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="fr">Français</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select><FormDescription>{t('default_language_desc')}</FormDescription><FormMessage /></FormItem>)} />
                <Button type="submit" disabled={form.formState.isSubmitting}>{t('save_changes')}</Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t('confirm_global_changes_title')}</AlertDialogTitle><AlertDialogDescription>{t('confirm_global_changes_desc')}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setPendingSettings(null)}>{t('cancel')}</AlertDialogCancel><AlertDialogAction onClick={handleConfirmSave}>{t('save_changes')}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GeneralSettingsForm;