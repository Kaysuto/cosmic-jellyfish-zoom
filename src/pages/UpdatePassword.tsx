import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { auditLog } from '@/utils/audit';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, AlertTriangle } from 'lucide-react';
import { FooterContent } from '@/components/layout/FooterContent';
import { useSession } from '@/contexts/AuthContext';

const UpdatePassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { session, loading: sessionLoading } = useSession();
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      const errorCode = params.get('error_code');
      const errorDescription = params.get('error_description');

      if (errorCode === 'otp_expired') {
        setPageError(t('email_link_expired'));
      } else if (errorDescription) {
        setPageError(errorDescription.replace(/\+/g, ' '));
      }
    }
  }, [t]);

  const isReady = !sessionLoading && session && !pageError;

  const passwordSchema = useMemo(() => z.object({
    password: z.string()
      .min(6, { message: t('password_too_short') })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: t('password_requirements') }),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t('passwords_do_not_match'),
    path: ['confirmPassword'],
  }), [i18n.language]);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      form.trigger();
    }
  }, [i18n.language, form]);

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      showError(error.message);
    } else {
      showSuccess(t('password_updated_successfully'));
      // Log audit event for password update
      try {
        await auditLog('password_updated', { method: 'self_reset' });
      } catch (e) {
        console.error('auditLog error:', e);
      }
      navigate('/login');
    }
    setIsLoading(false);
  };

  const renderCardContent = () => {
    if (pageError) {
      return (
        <div className="text-center space-y-4">
          <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
          <p className="text-destructive-foreground">{pageError}</p>
          <Button asChild className="w-full">
            <Link to="/login">{t('back_to_login')}</Link>
          </Button>
        </div>
      );
    }

    if (isReady) {
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem><FormLabel>{t('new_password')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem><FormLabel>{t('confirm_new_password')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? t('saving') : t('update_password')}</Button>
          </form>
        </Form>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-400">{t('loading_session')}</p>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-900 text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-transparent to-gray-900 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                {t('update_password')}
              </CardTitle>
              <CardDescription className="text-gray-400 pt-2">
                {t('update_your_password')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCardContent()}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="relative z-10 w-full bg-transparent">
        <FooterContent />
      </footer>
    </div>
  );
};

export default UpdatePassword;