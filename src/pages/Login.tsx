import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { motion } from 'framer-motion';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();

  useEffect(() => {
    if (session) {
      navigate('/admin');
    }
  }, [session, navigate]);

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Fond animé */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-transparent to-gray-900 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      {/* Bouton de retour */}
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
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              {t('admin_login')}
            </h1>
          </div>
          <div className="p-8 space-y-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={[]}
              theme="dark"
              localization={{
                variables: {
                  sign_in: {
                    email_label: t('email_address'),
                    password_label: t('password'),
                    button_label: t('sign_in'),
                    link_text: t('already_have_account'),
                    email_input_placeholder: t('email_placeholder'),
                    password_input_placeholder: t('password_placeholder'),
                  },
                  sign_up: {
                    email_label: t('email_address'),
                    password_label: t('password'),
                    button_label: t('sign_up'),
                    link_text: t('dont_have_account'),
                    email_input_placeholder: t('email_placeholder'),
                    password_input_placeholder: t('password_placeholder'),
                  },
                  forgotten_password: {
                    email_label: t('email_address'),
                    button_label: t('send_instructions'),
                    link_text: t('forgot_password'),
                    email_input_placeholder: t('email_placeholder'),
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 w-full bg-transparent">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Login;