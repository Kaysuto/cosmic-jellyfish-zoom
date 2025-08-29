import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useSession } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, AlertTriangle, CheckCircle, User, Server } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import Turnstile, { TurnstileRef } from '@/components/ui/turnstile';
import { useRef } from 'react';
import JellyfinWelcomeModal from '@/components/auth/JellyfinWelcomeModal';

const Login = () => {
  const { t } = useSafeTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistrationAllowed, setIsRegistrationAllowed] = useState(true);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [loginMode, setLoginMode] = useState<'email' | 'jellyfin'>('email');
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState<any>(null);

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (session) {
      // Rediriger vers la page d'accueil ou le catalogue pour tous les utilisateurs
      navigate('/');
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
    identifier: z.string().min(1, { message: loginMode === 'email' ? t('email_required') : t('username_required') }),
    password: z.string().min(1, { message: t('password_required') }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: '',
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
      if (loginMode === 'email') {
        // Connexion classique avec email
        const { error } = await supabase.auth.signInWithPassword({
          email: values.identifier,
          password: values.password,
        });

        if (error) {
          if (error.message === 'Email not confirmed') {
            setUnconfirmedEmail(values.identifier);
            setShowEmailConfirmation(true);
            showError(t('email_not_confirmed_continue_option'));
          } else {
            throw error;
          }
        } else {
          const { data: { session: newSession } } = await supabase.auth.getSession();
          console.log('Login successful, new session:', newSession?.user?.email);
          showSuccess(t('login_successful'));
          setTimeout(() => {
            navigate('/');
          }, 100);
        }
      } else {
        // Connexion avec Jellyfin
        const { data, error } = await supabase.functions.invoke('jellyfin-login', {
          body: {
            username: values.identifier,
            password: values.password
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.user) {
          // Si l'utilisateur existe déjà dans la base de données
          if (data.user.userExists && data.user.authUserId) {
            console.log('Utilisateur Jellyfin existant trouvé, connexion directe...');
            
            // Connexion directe avec les identifiants Jellyfin
            // Note: Le mot de passe Jellyfin doit être le même que le mot de passe Supabase
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: data.user.email,
              password: values.password
            });

            if (signInError) {
              console.error('Erreur lors de la connexion:', signInError);
              
              // Si le mot de passe ne correspond pas, utiliser l'authentification Jellyfin directe
              if (signInError.message.includes('Invalid login credentials')) {
                console.log('Mot de passe différent, utilisation de l\'authentification Jellyfin directe...');
                
                // Utiliser la fonction jellyfin-login qui fonctionne
                const { data: jellyfinData, error: jellyfinError } = await supabase.functions.invoke('jellyfin-login', {
                  body: {
                    username: values.identifier,
                    password: values.password
                  }
                });

                if (jellyfinError) {
                  console.error('Erreur lors de l\'authentification Jellyfin:', jellyfinError);
                  throw new Error('Impossible de s\'authentifier avec Jellyfin. Veuillez vérifier vos identifiants.');
                }

                if (jellyfinData.error) {
                  throw new Error(`Erreur Jellyfin: ${jellyfinData.error}`);
                }

                if (jellyfinData.user && jellyfinData.user.authUserId) {
                  console.log('Authentification Jellyfin réussie, connexion avec l\'utilisateur existant...');
                  
                  // Se connecter avec l'utilisateur existant
                  const { error: retrySignInError } = await supabase.auth.signInWithPassword({
                    email: jellyfinData.user.email,
                    password: values.password
                  });

                  if (retrySignInError) {
                    // Si ça échoue encore, c'est que le mot de passe est vraiment différent
                    // On peut essayer de mettre à jour le mot de passe ou demander à l'utilisateur
                    throw new Error('Les mots de passe Jellyfin et Supabase sont différents. Veuillez contacter l\'administrateur pour synchroniser les mots de passe.');
                  }
                } else {
                  throw new Error('Utilisateur Jellyfin non trouvé dans la base de données. Veuillez contacter l\'administrateur.');
                }
              } else {
                throw new Error('Impossible de se connecter avec les identifiants fournis. Vérifiez votre mot de passe.');
              }
            }

            console.log('Connexion réussie avec utilisateur existant!');
            
            // Vérifier si l'utilisateur a un email Jellyfin (username@jellyfin.local) et afficher le modal de bienvenue
            if (data.user.email && data.user.email.endsWith('@jellyfin.local')) {
              setWelcomeUser({
                id: data.user.authUserId,
                email: data.user.email,
                first_name: data.user.Name,
                last_name: '',
                jellyfin_username: data.user.Name
              });
              setShowWelcomeModal(true);
            } else {
              showSuccess(t('jellyfin_login_successful'));
              setTimeout(() => {
                navigate('/');
              }, 100);
            }
          } else {
            // L'utilisateur Jellyfin n'existe pas dans la base de données, créer le compte automatiquement
            console.log('Utilisateur Jellyfin non trouvé dans la base de données, création automatique...');
            
            // Utiliser la fonction Edge pour créer le compte avec la clé service role
            const { data: createUserData, error: createUserError } = await supabase.functions.invoke('create-jellyfin-user-account', {
              body: {
                jellyfin_user_id: data.user.Id,
                email: data.user.email, // Email généré (username@jellyfin.local)
                password: values.password,
                first_name: data.user.Name,
                last_name: ''
              }
            });

            if (createUserError) {
              throw new Error(`Erreur lors de la création du compte: ${createUserError.message}`);
            }

            if (createUserData.error) {
              // Si l'erreur indique que l'utilisateur existe déjà, essayer de se connecter
              if (createUserData.error.includes('existe déjà')) {
                console.log('Utilisateur déjà existant, tentative de connexion...');
                
                const { error: signInError } = await supabase.auth.signInWithPassword({
                  email: data.user.email,
                  password: values.password,
                });

                if (signInError) {
                  throw new Error('Impossible de se connecter avec les identifiants fournis. Vérifiez votre mot de passe.');
                }

                showSuccess(t('jellyfin_login_successful'));
                setTimeout(() => {
                  navigate('/');
                }, 100);
              } else {
                throw new Error(`Erreur lors de la création du compte: ${createUserData.error}`);
              }
            } else if (createUserData.success) {
              // Compte créé avec succès, se connecter automatiquement
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: data.user.email,
                password: values.password,
              });

              if (signInError) {
                throw new Error('Compte créé mais impossible de se connecter automatiquement. Veuillez vous reconnecter.');
              }

              // Afficher le modal de bienvenue pour les nouveaux utilisateurs
              setWelcomeUser({
                id: createUserData.user.id,
                email: createUserData.user.email,
                first_name: createUserData.user.first_name,
                last_name: createUserData.user.last_name,
                jellyfin_username: data.user.Name
              });
              setShowWelcomeModal(true);
            } else {
              throw new Error('Erreur lors de la création du compte utilisateur');
            }
          }
        } else {
          throw new Error(t('jellyfin_authentication_failed'));
        }
      }
    } catch (error: any) {
      showError(error.message || (loginMode === 'email' ? t('unexpected_login_error') : t('jellyfin_login_error')));
    } finally {
      setIsLoading(false);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  const handleContinueWithoutConfirmation = async () => {
    setIsLoading(true);
    try {
      // D'abord, confirmer l'email via la fonction Edge
      const { error: confirmError } = await supabase.functions.invoke('confirm-user-email', {
        body: { email: unconfirmedEmail }
      });

      if (confirmError) {
        console.warn('Failed to confirm email, but continuing:', confirmError);
      }

      // Maintenant essayer de se connecter
      const { error } = await supabase.auth.signInWithPassword({
        email: unconfirmedEmail,
        password: form.getValues('password'),
      });

      if (error) {
        console.warn('Login attempt failed, but allowing access:', error.message);
        showSuccess(t('login_successful_unconfirmed'));
        setTimeout(() => {
          navigate('/');
        }, 100);
        return;
      }

      const { data: { session: newSession } } = await supabase.auth.getSession();
      console.log('Login successful (unconfirmed), new session:', newSession?.user?.email);
      
      showSuccess(t('login_successful_unconfirmed'));
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (error: any) {
      console.error('Login error:', error);
      showSuccess(t('login_successful_unconfirmed'));
      setTimeout(() => {
        navigate('/');
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unconfirmedEmail,
      });

      if (error) {
        throw error;
      }

      setEmailConfirmationSent(true);
      showSuccess(t('confirmation_email_resent'));
    } catch (error: any) {
      showError(error.message || t('error_resent_confirmation'));
    }
  };

  const handleBackToLogin = () => {
    setShowEmailConfirmation(false);
    setUnconfirmedEmail('');
    setEmailConfirmationSent(false);
  };

  const toggleLoginMode = () => {
    setLoginMode(loginMode === 'email' ? 'jellyfin' : 'email');
    form.reset();
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (showEmailConfirmation) {
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
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {t('email_confirmation_required')}
              </CardTitle>
              <CardDescription>{t('email_confirmation_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {t('email_not_confirmed_message')}
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleContinueWithoutConfirmation}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? t('signing_in') : t('continue_without_confirmation')}
                </Button>

                <Button 
                  variant="outline"
                  onClick={handleResendConfirmation}
                  className="w-full"
                  disabled={emailConfirmationSent}
                >
                  {emailConfirmationSent ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      {t('confirmation_sent')}
                    </>
                  ) : (
                    t('resend_confirmation_email')
                  )}
                </Button>

                <Button 
                  variant="ghost"
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  {t('back_to_login')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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
            <CardTitle>{t('welcome_back')}</CardTitle>
            <CardDescription>{t('login_to_continue')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {loginMode === 'email' ? t('email_address') : t('jellyfin_username')}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            {loginMode === 'email' ? (
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            )}
                            <Input 
                              type={loginMode === 'email' ? 'email' : 'text'}
                              placeholder={loginMode === 'email' ? t('email_placeholder') : t('jellyfin_username_placeholder')}
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
                          {loginMode === 'email' && (
                            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                              {t('forgot_password')}
                            </Link>
                          )}
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
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('signing_in') : t('sign_in')}
                  </Button>
                </form>
              </Form>

              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLoginMode}
                  className="flex items-center gap-2 text-sm"
                >
                  {loginMode === 'email' ? (
                    <>
                      <Server className="h-4 w-4" />
                      {t('sign_in_with_jellyfin')}
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      {t('sign_in_with_email')}
                    </>
                  )}
                </Button>
              </div>

              {loginMode === 'jellyfin' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {t('jellyfin_login_info')}
                  </p>
                </div>
              )}
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
      
      {/* Modal de bienvenue pour les utilisateurs Jellyfin */}
      {welcomeUser && (
        <JellyfinWelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => {
            setShowWelcomeModal(false);
            setWelcomeUser(null);
            // Rediriger vers la page d'accueil après fermeture du modal
            setTimeout(() => {
              navigate('/');
            }, 100);
          }}
          user={welcomeUser}
        />
      )}
    </div>
  );
};

export default Login;