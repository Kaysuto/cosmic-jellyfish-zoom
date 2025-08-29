import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Server } from 'lucide-react';
import SignInForm from '@/components/auth/SignInForm';
import JellyfinLoginForm from '@/components/auth/JellyfinLoginForm';

const SignInPage = () => {
  const { t } = useSafeTranslation();
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'email' | 'jellyfin'>('email');

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('welcome_back')}
          </h1>
          <p className="text-gray-600">
            {t('access_your_dashboard')}
          </p>
        </div>

        {/* Sélecteur de méthode de connexion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t('choose_login_method')}</CardTitle>
            <CardDescription className="text-center">
              {t('choose_login_method_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={loginMethod === 'email' ? 'default' : 'outline'}
                onClick={() => setLoginMethod('email')}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Mail className="h-6 w-6" />
                <span>{t('email')}</span>
              </Button>
              <Button
                variant={loginMethod === 'jellyfin' ? 'default' : 'outline'}
                onClick={() => setLoginMethod('jellyfin')}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Server className="h-6 w-6" />
                <span>{t('jellyfin')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de connexion */}
        {loginMethod === 'email' ? (
          <SignInForm onSuccess={handleSuccess} />
        ) : (
          <JellyfinLoginForm 
            onSuccess={handleSuccess}
            onSwitchToEmail={() => setLoginMethod('email')}
          />
        )}

        {/* Liens de navigation */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            {t('dont_have_account')}{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={() => navigate('/auth/signup')}
            >
              {t('sign_up')}
            </Button>
          </p>
          <p className="text-sm text-gray-600">
            {t('forgot_password')}{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={() => navigate('/auth/forgot-password')}
            >
              {t('send_instructions')}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
