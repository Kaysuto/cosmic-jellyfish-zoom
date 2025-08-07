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
import { User } from 'lucide-react';
import { Profile } from '@/hooks/useProfile';
import { useMemo, useEffect } from 'react';
import { auditLog } from '@/utils/audit';

interface UpdateProfileFormProps {
  profile: Profile;
}

const UpdateProfileForm = ({ profile }: UpdateProfileFormProps) => {
  const { t, i18n } = useTranslation();

  const profileSchema = useMemo(() => z.object({
    first_name: z.string().min(1, { message: t('first_name_required') }),
    last_name: z.string().min(1, { message: t('last_name_required') }),
  }), [t]);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: { first_name: profile.first_name || '', last_name: profile.last_name || '' },
  });

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) form.trigger();
  }, [i18n.language, form]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    const { error } = await supabase.from('profiles').update(values).eq('id', profile.id);
    if (error) {
      showError(t('error_updating_profile'));
    } else {
      showSuccess(t('profile_updated_successfully'));
      await auditLog('profile_updated', { profileId: profile.id, changes: values });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> {t('personal_information')}</CardTitle>
        <CardDescription>{t('update_your_personal_information')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>{t('first_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>{t('last_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>{t('save_changes')}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UpdateProfileForm;