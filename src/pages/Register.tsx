import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useSession } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import SignUpForm from '@/components/auth/SignUpForm';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import Turnstile, { TurnstileRef } from '@/components/ui/turnstile';
import { useRef } from 'react';

const Register = () => {
  const { t } = useSafeTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistrationAllowed, setIsRegistrationAllowed] = useState(true);
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (session) {
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
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        setIsRegistrationAllowed(data ? data.value === 'true' : true);
      } catch (error) {
        console.error("Error fetching registration status:", error);
        setIsRegistrationAllowed(true);
      }
    };

    fetchRegistrationStatus();
  }, []);

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

  const handleSubmit = async (values: any) => {
    if (turnstileSiteKey && !turnstileToken) {
      showError(t('complete_captcha'));
      return;
    }

    if (!isRegistrationAllowed) {
      showError(t('registrations_are_closed'));
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: values.email,
          password: values.password,
          first_name: values.first_name,
          last_name: values.last_name,
          role: 'user'
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      showSuccess(t('registration_successful'));
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      showError(error.message || t('registration_failed'));
    } finally {
      setIsLoading(false);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (!isRegistrationAllowed) {
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
              <CardTitle>{t('registrations_closed')}</CardTitle>
              <CardDescription>{t('registrations_are_closed_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">{t('contact_admin_for_access')}</p>
                <Link to="/login" className="inline-flex items-center text-primary hover:underline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('back_to_login')}
                </Link>
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
            <CardTitle>{t('create_account')}</CardTitle>
            <CardDescription>{t('sign_up_to_continue')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SignUpForm onSubmit={handleSubmit} isLoading={isLoading} />
              
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
            </div>
            <Separator className="my-6" />
            <div className="text-center text-sm">
              {t('already_have_account')}{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                {t('sign_in')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
