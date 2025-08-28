import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Github, Mail } from 'lucide-react';
import Turnstile, { TurnstileRef } from '@/components/ui/turnstile';
import { useRef } from 'react';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isRegistrationAllowed, setIsRegistrationAllowed] = useState(true);
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (session) {
      navigate('/admin/dashboard');
    }
  }, [session, navigate]);

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'allow_new_registrations')
          .single();
        
        if (error && error.code !== 'PGRST116') { // Ignore "exact one row was not found"
          throw error;
        }
        
        // Default to true if setting is not found
        setIsRegistrationAllowed(data ? data.value === 'true' : true);
      } catch (error) {
        console.error("Error fetching registration status:", error);
        // Default to allowing registration if there's an error fetching the setting
        setIsRegistrationAllowed(true);
      }
    };

    fetchRegistrationStatus();
  }, []);

  const formSchema = z.object({
    email: z.string().email({ message: t('invalid_email') }),
    password: z.string().min(1, { message: t('password_required') }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
  };

  const handleTurnstileExpire = () => {
    setTurnstileToken(null);
  };

  const handleTurnstileError = () => {
    showError(t('turnstile_error'));
    setTurnstileToken(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (turnstileSiteKey && !turnstileToken) {
      showError(t('complete_captcha'));
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message === 'Email not confirmed') {
          showError(t('email_not_confirmed'));
          // Optionnel : Renvoyer l'e-mail de confirmation
          await supabase.auth.resend({
            type: 'signup',
            email: values.email,
          });
        } else {
          throw error;
        }
      } else {
        showSuccess(t('login_successful'));
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      showError(error.message || t('unexpected_login_error'));
    } finally {
      setIsLoading(false);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  const handleGithubLogin = async () => {
    setIsGithubLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      showError(error.message);
      setIsGithubLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('access_your_dashboard')}</CardTitle>
            <CardDescription>{t('login_to_continue')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleGithubLogin}
                disabled={isGithubLoading || isLoading}
              >
                <Github className="mr-2 h-4 w-4" />
                {t('login_with_github')}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t('or_continue_with')}
                  </span>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('email_address')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="email" 
                              placeholder={t('email_placeholder')} 
                              {...field} 
                              className="pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>{t('password')}</FormLabel>
                          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                            {t('forgot_password')}
                          </Link>
                        </div>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {turnstileSiteKey && (
                    <div className="flex justify-center">
                      <Turnstile
                        ref={turnstileRef}
                        sitekey={turnstileSiteKey}
                        onSuccess={handleTurnstileSuccess}
                        onExpire={handleTurnstileExpire}
                        onError={handleTurnstileError}
                        theme="dark"
                        size="normal"
                        className="mx-auto"
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading || isGithubLoading}>
                    {isLoading ? t('signing_in') : t('sign_in')}
                  </Button>
                </form>
              </Form>
            </div>
            <Separator className="my-6" />
            <div className="text-center text-sm">
              {isRegistrationAllowed ? (
                <>
                  {t('dont_have_account')}{' '}
                  <Link to="/register" className="font-medium text-primary hover:underline">
                    {t('sign_up')}
                  </Link>
                </>
              ) : (
                <p className="text-muted-foreground">{t('registrations_are_closed')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;