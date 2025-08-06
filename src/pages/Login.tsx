import { Auth } from '@supabase/auth-ui-react';
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
              providers={[]}
              appearance={{
                className: {
                  container: 'space-y-6',
                  label: 'text-sm font-medium text-gray-300',
                  input: 'flex h-10 w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  button: 'inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full',
                  anchor: 'text-sm text-blue-400 hover:text-blue-300 hover:underline',
                  message: 'text-sm text-red-400 mt-2',
                  divider: 'bg-gray-600'
                }
              }}
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