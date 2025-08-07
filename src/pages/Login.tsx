import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, Terminal } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'signin' | 'signup'>('signin');
  const [allowRegistrations, setAllowRegistrations] = useState(false);
  const [checkingSettings, setCheckingSettings] = useState(true);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      setCheckingSettings(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'allow_registrations')
        .single();

      if (error) {
        console.error("Error fetching registration status:", error);
        setAllowRegistrations(false);
      } else {
        setAllowRegistrations(data.value === 'true');
      }
      setCheckingSettings(false);
    };

    checkRegistrationStatus();

    const channel = supabase
      .channel('app-settings-change')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_settings',
          filter: 'key=eq.allow_registrations',
        },
        (payload) => {
          const newSetting = payload.new as { value: string };
          setAllowRegistrations(newSetting.value === 'true');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loginSchema = useMemo(() => z.object({
    email: z.string().email({ message: t('invalid_email') }),
    password: z.string().min(1, { message: t('password_required') }),
  }), [i18n.language]);

  const signupSchema = useMemo(() => z.object({
    email: z.string().email({ message: t('invalid_email') }),
    password: z.string()
      .min(6, { message: t('password_too_short') })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: t('password_requirements') }),
    first_name: z.string().min(1, { message: t('first_name_required') }),
    last_name: z.string().min(1, { message: t('last_name_required') }),
  }), [i18n.language]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', first_name: '', last_name: '' },
  });

  useEffect(() => {
    if (session) {
      navigate('/admin');
    }
  }, [session, navigate]);

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      showError(error.message);
    } else {
      showSuccess("Connexion réussie !");
      navigate('/admin');
    }
    setIsLoading(false);
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          first_name: values.first_name,
          last_name: values.last_name,
        },
      },
    });
    if (error) {
      showError(error.message);
    } else {
      showSuccess("Compte créé ! Veuillez vérifier vos e-mails pour confirmer votre inscription.");
    }
    setIsLoading(false);
  };

  const SignInForm = (
    <Form {...loginForm}>
      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
        <FormField control={loginForm.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>{t('email_address')}</FormLabel><FormControl><Input type="email" placeholder={t('email_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={loginForm.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>{t('password')}</FormLabel><FormControl><Input type="password" placeholder={t('password_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? t('saving') : t('sign_in')}</Button>
      </form>
    </Form>
  );

  const SignUpForm = (
    <Form {...signupForm}>
      <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={signupForm.control} name="first_name" render={({ field }) => (
            <FormItem><FormLabel>{t('first_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={signupForm.control} name="last_name" render={({ field }) => (
            <FormItem><FormLabel>{t('last_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={signupForm.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>{t('email_address')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={signupForm.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>{t('password')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? t('saving') : t('sign_up')}</Button>
      </form>
    </Form>
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-900 text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-transparent to-gray-900 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      <div className="absolute top-4 left-4 z-20">
        <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('return_home')}
          </Link>
        </Button>
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
                {view === 'signin' ? t('admin_login') : t('sign_up')}
              </CardTitle>
              <CardDescription className="text-gray-400 pt-2">
                {view === 'signin' ? 'Accédez à votre tableau de bord' : 'Créez un nouveau compte'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkingSettings ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {view === 'signin' ? SignInForm : SignUpForm}
                  
                  {allowRegistrations && (
                    <div className="text-center text-sm text-gray-400">
                      {view === 'signin' ? (
                        <>
                          {t('dont_have_account')}{' '}
                          <Button variant="link" className="p-0 h-auto text-blue-400" onClick={() => setView('signup')}>{t('sign_up')}</Button>
                        </>
                      ) : (
                        <>
                          {t('already_have_account')}{' '}
                          <Button variant="link" className="p-0 h-auto text-blue-400" onClick={() => setView('signin')}>{t('sign_in')}</Button>
                        </>
                      )}
                    </div>
                  )}

                  {!allowRegistrations && view === 'signin' && (
                     <Alert className="mt-6 bg-blue-900/30 border-blue-500/30 text-blue-300">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>
                          {t('registrations_are_closed')}
                        </AlertDescription>
                      </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="relative z-10 w-full bg-transparent">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Login;