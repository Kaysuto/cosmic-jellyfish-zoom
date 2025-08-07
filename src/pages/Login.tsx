import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [allowRegistrations, setAllowRegistrations] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      setLoadingSettings(true);
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
      setLoadingSettings(false);
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

  useEffect(() => {
    if (session) {
      navigate('/admin', { replace: true });
    }
  }, [session, navigate]);

  const localization = {
    variables: {
      sign_in: {
        email_label: t('email_address'),
        password_label: t('password'),
        email_input_placeholder: t('email_placeholder'),
        password_input_placeholder: t('password_placeholder'),
        button_label: t('sign_in'),
        social_provider_text: 'Se connecter avec {{provider}}',
        link_text: t('dont_have_account') + " " + t('sign_up'),
      },
      sign_up: {
        email_label: t('email_address'),
        password_label: t('password'),
        email_input_placeholder: t('email_placeholder'),
        password_input_placeholder: t('password_placeholder'),
        button_label: t('sign_up'),
        social_provider_text: 'S\'inscrire avec {{provider}}',
        link_text: t('already_have_account') + " " + t('sign_in'),
        confirmation_text: t('account_created_check_email'),
      },
      forgotten_password: {
        email_label: t('email_address'),
        email_input_placeholder: t('email_placeholder'),
        button_label: t('send_recovery_link'),
        link_text: t('forgot_password'),
        confirmation_text: t('password_reset_email_sent'),
      },
      update_password: {
        password_label: t('new_password'),
        password_input_placeholder: t('new_password'),
        button_label: t('update_password'),
        confirmation_text: t('password_updated_successfully'),
      },
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-900 text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-transparent to-gray-900 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>
      <div className="absolute top-4 left-4 z-20"><Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white"><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{t('return_home')}</Link></Button></div>
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="w-full max-w-md">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">{t('admin_login')}</CardTitle>
              <CardDescription className="text-gray-400 pt-2">{t('access_your_dashboard')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSettings ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
              ) : (
                <Auth
                  supabaseClient={supabase}
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: 'hsl(222.2 47.4% 11.2%)',
                          brandAccent: 'hsl(210 40% 98%)',
                          brandButtonText: 'white',
                          defaultButtonBackground: 'hsl(217.2 32.6% 17.5%)',
                          defaultButtonBackgroundHover: 'hsl(217.2 32.6% 22.5%)',
                          defaultButtonBorder: 'hsl(217.2 32.6% 17.5%)',
                          defaultButtonText: 'white',
                          dividerBackground: 'hsl(217.2 32.6% 17.5%)',
                          inputBackground: 'transparent',
                          inputBorder: 'hsl(217.2 32.6% 17.5%)',
                          inputBorderHover: 'hsl(217.2 32.6% 27.5%)',
                          inputBorderFocus: 'hsl(217.2 32.6% 27.5%)',
                          inputText: 'white',
                          inputLabelText: 'hsl(215 20.2% 65.1%)',
                          inputPlaceholder: 'hsl(215 20.2% 65.1%)',
                          messageText: 'hsl(215 20.2% 65.1%)',
                          messageTextDanger: 'hsl(0 62.8% 30.6%)',
                        },
                        space: {
                          spaceSmall: '4px',
                          spaceMedium: '8px',
                          spaceLarge: '16px',
                          labelBottomMargin: '8px',
                          anchorBottomMargin: '8px',
                          emailInputSpacing: '8px',
                          socialAuthSpacing: '8px',
                          buttonPadding: '10px 15px',
                          inputPadding: '10px 15px',
                        },
                        fontSizes: {
                          baseBodySize: '14px',
                          baseInputSize: '14px',
                          baseLabelSize: '14px',
                          baseButtonSize: '14px',
                        },
                        fonts: {
                          bodyFontFamily: `inherit`,
                          buttonFontFamily: `inherit`,
                          inputFontFamily: `inherit`,
                          labelFontFamily: `inherit`,
                        },
                        borderWidths: {
                          buttonBorderWidth: '1px',
                          inputBorderWidth: '1px',
                        },
                        radii: {
                          borderRadiusButton: 'var(--radius)',
                          buttonBorderRadius: 'var(--radius)',
                          inputBorderRadius: 'var(--radius)',
                        },
                      },
                    },
                  }}
                  providers={[]}
                  theme="dark"
                  showLinks={allowRegistrations}
                  localization={localization}
                  redirectTo={`${window.location.origin}/`}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <footer className="relative z-10 w-full bg-transparent"><MadeWithDyad /></footer>
    </div>
  );
};

export default Login;