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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('return_home')}
            </Link>
          </Button>
        </div>
        <div className="p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-white">{t('admin_login')}</h2>
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
                },
                sign_up: {
                  email_label: t('email_address'),
                  password_label: t('password'),
                  button_label: t('sign_up'),
                  link_text: t('dont_have_account'),
                },
                forgotten_password: {
                  email_label: t('email_address'),
                  button_label: t('send_instructions'),
                  link_text: t('forgot_password'),
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;