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
import { Mail, KeyRound } from 'lucide-react';
import { Profile } from '@/hooks/useProfile';
import { useMemo, useEffect } from 'react';

const emailRegex = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

interface AdminUpdateUserFormProps {
  user: Profile;
}

const AdminUpdateUserForm = ({ user }: AdminUpdateUserFormProps) => {
  const { t, i18n } = useTranslation();

  const formSchema = useMemo(() => z.object({
    email: z.string().regex(emailRegex, { message: t('invalid_email') }),
    password: z.string().optional(),
  }), [t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: { email: user.email || '' },
  });

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) form.trigger();
  }, [i18n.language, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const attributes: { email?: string; password?: string } = {};
    if (values.email && values.email !== user.email) {
      attributes.email = values.email;
    }
    if (values.password) {
      attributes.password = values.password;
    }

    if (Object.keys(attributes).length === 0) {
      showSuccess("Aucune modification à enregistrer.");
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('update-user-details', {
        body: { userId: user.id, attributes },
      });
      if (error) throw error;
      showSuccess("Détails de l'utilisateur mis à jour avec succès.");
      form.reset({ ...values, password: '' });
    } catch (error: any) {
      showError(`Erreur: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> {t('change_email')} & {t('change_password')}</CardTitle>
        <CardDescription>Mettez à jour l'e-mail ou réinitialisez le mot de passe de l'utilisateur.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>{t('email_address')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>{t('new_password')} (laisser vide pour ne pas changer)</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <Button type="submit" disabled={form.formState.isSubmitting}>{t('save_changes')}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AdminUpdateUserForm;