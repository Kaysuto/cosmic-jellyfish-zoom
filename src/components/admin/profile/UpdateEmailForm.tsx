import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { strictEmailRegex } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail } from 'lucide-react';
import { Profile } from '@/hooks/useProfile';
import { useMemo, useEffect } from 'react';

interface UpdateEmailFormProps {
  profile: Profile;
}

const UpdateEmailForm = ({ profile }: UpdateEmailFormProps) => {
  const { t, i18n } = useTranslation();

  const emailSchema = useMemo(() => z.object({
    email: z.string().regex(strictEmailRegex, { message: t('invalid_email') }),
  }), [t]);

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    values: { email: profile.email || '' },
  });

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) form.trigger();
  }, [i18n.language, form]);

  const onSubmit = async (values: z.infer<typeof emailSchema>) => {
    const { error } = await supabase.auth.updateUser({ email: values.email });
    if (error) showError(t('error_updating_email'));
    else showSuccess(t('email_update_confirmation_sent'));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> {t('change_email')}</CardTitle>
        <CardDescription>{t('update_your_email_address')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>{t('email_address')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <Button type="submit" disabled={form.formState.isSubmitting}>{t('update_email')}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UpdateEmailForm;