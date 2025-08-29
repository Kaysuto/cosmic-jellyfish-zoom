import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useSession } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, ArrowLeft } from 'lucide-react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import Turnstile, { TurnstileRef } from '@/components/ui/turnstile';
import { useRef } from 'react';

const ForgotPassword = () => {
  const { t } = useSafeTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

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

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      showSuccess(t('password_reset_email_sent'));
      navigate('/login');
    } catch (error: any) {
      console.error('Password reset error:', error);
      showError(error.message || t('unexpected_reset_error'));
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
            <CardTitle>{t('reset_password_title')}</CardTitle>
            <CardDescription>{t('reset_password_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
              
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
};

export default ForgotPassword;
