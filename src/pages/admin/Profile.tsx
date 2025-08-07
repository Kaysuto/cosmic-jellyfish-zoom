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
import { ArrowLeft, User, Mail, KeyRound, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGravatarURL } from '@/lib/gravatar';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useMemo, useEffect } from 'react';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { profile, loading: profileLoading } = useProfile();
  const { session } = useSession();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const profileSchema = useMemo(() => z.object({
    first_name: z.string().min(1, { message: t('first_name_required') }),
    last_name: z.string().min(1, { message: t('last_name_required') }),
  }), [t]);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    },
  });

  const emailSchema = useMemo(() => z.object({
    email: z.string().email({ message: t('invalid_email') }),
  }), [t]);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    values: {
      email: profile?.email || '',
    },
  });

  const passwordSchema = useMemo(() => z.object({
    password: z.string()
      .min(6, { message: t('password_too_short') })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: t('password_requirements') }),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t('passwords_do_not_match'),
    path: ['confirmPassword'],
  }), [t]);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (Object.keys(profileForm.formState.errors).length > 0) {
      profileForm.trigger();
    }
  }, [i18n.language, profileForm]);

  useEffect(() => {
    if (Object.keys(emailForm.formState.errors).length > 0) {
      emailForm.trigger();
    }
  }, [i18n.language, emailForm]);

  useEffect(() => {
    if (Object.keys(passwordForm.formState.errors).length > 0) {
      passwordForm.trigger();
    }
  }, [i18n.language, passwordForm]);

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

  const UserProfileCard = () => (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={profile?.avatar_url || getGravatarURL(profile?.email, 160)} />
            <AvatarFallback className="text-3xl">
              {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-1">{t('role')}</h3>
          <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
            {profile?.role === 'admin' ? t('admin_role') : t('user_role')}
          </Badge>
        </div>
        {session?.user?.created_at && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">{t('member_since')}</h3>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(session.user.created_at), 'd MMMM yyyy', { locale: currentLocale })}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="flex items-center gap-4 p-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-6 w-32" />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost">
          <Link to="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('return_to_dashboard')}
          </Link>
        </Button>
      </div>

      {profileLoading ? <LoadingSkeleton /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 space-y-6">
            <UserProfileCard />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> {t('personal_information')}</CardTitle>
                <CardDescription>{t('update_your_personal_information')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={profileForm.control} name="first_name" render={({ field }) => (
                        <FormItem><FormLabel>{t('first_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={profileForm.control} name="last_name" render={({ field }) => (
                        <FormItem><FormLabel>{t('last_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>{t('save_changes')}</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> {t('change_email')}</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> {t('change_password')}</CardTitle>
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
      )}
    </div>
  );
};

export default Profile;