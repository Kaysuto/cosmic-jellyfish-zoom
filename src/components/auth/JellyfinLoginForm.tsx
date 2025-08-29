import { useState } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import JellyfinWelcomeModal from './JellyfinWelcomeModal';

interface JellyfinLoginFormProps {
  onSuccess?: () => void;
  onSwitchToEmail?: () => void;
}

const JellyfinLoginForm = ({ onSuccess, onSwitchToEmail }: JellyfinLoginFormProps) => {
  const { t } = useSafeTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [jellyfinUser, setJellyfinUser] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      showError(t('username_required') || 'Nom d\'utilisateur requis');
      return;
    }

    setLoading(true);
    try {
      // Tenter la connexion avec Jellyfin
      const { data, error } = await supabase.functions.invoke('jellyfin-direct-auth', {
        body: {
          username: username.trim(),
          password: password
        }
      });

      if (error) throw error;
      
      if (data.error) {
        // Si l'utilisateur n'existe pas dans l'app mais existe dans Jellyfin
        if (data.error.includes('User not found') || data.error.includes('utilisateur n\'existe pas')) {
          // Utiliser les informations Jellyfin retournées par la fonction
          if (data.jellyfin_user) {
            setJellyfinUser(data.jellyfin_user);
            setShowWelcomeModal(true);
            return;
          }
        }
        throw new Error(data.error);
      }

      // Connexion réussie
      showSuccess(t('jellyfin_login_successful') || 'Connexion Jellyfin réussie !');
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error('Erreur de connexion Jellyfin:', error);
      showError(error.message || t('jellyfin_authentication_failed') || 'Échec de l\'authentification Jellyfin');
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    setJellyfinUser(null);
    // Rediriger vers la page de connexion après création du compte
    window.location.href = '/auth/signin';
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>{t('sign_in_with_jellyfin')}</CardTitle>
          <CardDescription>
            {t('jellyfin_login_info')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jellyfin-username">{t('jellyfin_username')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="jellyfin-username"
                  type="text"
                  placeholder={t('jellyfin_username_placeholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jellyfin-password">{t('jellyfin_password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="jellyfin-password"
                  type="password"
                  placeholder={t('password_placeholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !username.trim() || !password.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {t('signing_in_jellyfin')}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('sign_in_with_jellyfin')}
                </>
              )}
            </Button>
          </form>

          {onSwitchToEmail && (
            <>
              <Separator className="my-4" />
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={onSwitchToEmail}
                  className="text-sm"
                >
                  {t('sign_in_with_email')}
                </Button>
              </div>
            </>
          )}

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                {t('jellyfin_login_info')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de bienvenue pour les nouveaux utilisateurs */}
      <JellyfinWelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        jellyfinUser={jellyfinUser}
      />
    </>
  );
};

export default JellyfinLoginForm;
