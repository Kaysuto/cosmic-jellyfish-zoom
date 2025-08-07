import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();

  useEffect(() => {
    if (session) {
      navigate('/admin', { replace: true });
    }
  }, [session, navigate]);

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-900 text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-transparent to-gray-900 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>
      <div className="absolute top-4 left-4 z-20">
        <Link to="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white hover:bg-white/10 h-10 px-4 py-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('return_home')}
        </Link>
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
                {t('admin_login')}
              </CardTitle>
              <CardDescription className="text-gray-400 pt-2">
                {t('access_your_dashboard')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                theme="dark"
                providers={[]}
                localization={{
                  variables: {
                    sign_in: {
                      email_label: t('email_address'),
                      password_label: t('password'),
                      email_input_placeholder: t('email_placeholder'),
                      password_input_placeholder: t('password_placeholder'),
                      button_label: t('sign_in'),
                      social_provider_text: 'Se connecter avec {{provider}}',
                      link_text: t('already_have_account'),
                    },
                    sign_up: {
                      email_label: t('email_address'),
                      password_label: t('password'),
                      email_input_placeholder: t('email_placeholder'),
                      password_input_placeholder: t('password_placeholder'),
                      button_label: t('sign_up'),
                      social_provider_text: 'S\'inscrire avec {{provider}}',
                      link_text: t('dont_have_account'),
                      confirmation_text: t('account_created_check_email'),
                    },
                    forgotten_password: {
                      email_label: t('email_address'),
                      email_input_placeholder: t('email_placeholder'),
                      button_label: t('send_instructions'),
                      link_text: t('forgot_password'),
                      confirmation_text: t('password_reset_email_sent'),
                    },
                  },
                }}
              />
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