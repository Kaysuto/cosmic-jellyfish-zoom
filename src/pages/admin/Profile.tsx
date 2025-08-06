import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Profile = () => {
  const { t } = useTranslation();
  const { profile, loading: profileLoading } = useProfile();

  // Schéma et formulaire pour les informations personnelles
  const profileSchema = z.object({
    first_name: z.string().min(1, { message: t('first_name_required') }),
    last_name: z.string().min(1, { message: t('last_name_required') }),
  });
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    },
  });

  // Schéma et formulaire pour l'email
  const emailSchema = z.object({
    email: z.string().email({ message: t('invalid_email') }),
  });
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    values: {
      email: profile?.email || '',
    },
  });

  // Schéma et formulaire pour le mot de passe
  const passwordSchema = z.object({
    password: z.string().min(6, { message: t('password_too_short') }),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t('passwords_do_not_match'),
    path: ['confirmPassword'],
  });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!profile) return;
    const { error } = await supabase.from('profiles').update(values).eq('id', profile.id);
    if (error) showError(t('error_updating_profile'));
    else showSuccess(t('profile_updated_successfully'));
  };

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    const { error } = await supabase.auth.updateUser({ email: values.email });
    if (error) showError(t('error_updating_email'));
    else showSuccess(t('email_update_confirmation_sent'));
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) showError(t('error_updating_password'));
    else {
      showSuccess(t('password_updated_successfully'));
      passwordForm.reset();
    }
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link to="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('return_to_dashboard')}
          </Link>
        </Button>
      </div>
      <div className="space-y-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>{t('personal_information')}</CardTitle>
            <CardDescription>{t('update_your_personal_information')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField control={profileForm.control} name="first_name" render={({ field }) => (
                  <FormItem><FormLabel>{t('first_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={profileForm.control} name="last_name" render={({ field }) => (
                  <FormItem><FormLabel>{t('last_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>{t('save_changes')}</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Changer l'email */}
        <Card>
          <CardHeader>
            <CardTitle>{t('change_email')}</CardTitle>
            <CardDescription>{t('update_your_email_address')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField control={emailForm.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>{t('email_address')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={emailForm.formState.isSubmitting}>{t('update_email')}</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Changer le mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle>{t('change_password')}</CardTitle>
            <CardDescription>{t('update_your_password')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField control={passwordForm.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel>{t('new_password')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                  <FormItem><FormLabel>{t('confirm_new_password')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>{t('update_password')}</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;