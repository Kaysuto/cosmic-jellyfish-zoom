import { useState, useEffect } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface JellyfinWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  jellyfinUser?: {
    Id: string;
    Name: string;
    Email?: string;
  };
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

const JellyfinWelcomeModal = ({ isOpen, onClose, jellyfinUser }: JellyfinWelcomeModalProps) => {
  const { t } = useSafeTranslation();
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Pré-remplir les champs si l'utilisateur Jellyfin a des informations
  useEffect(() => {
    if (jellyfinUser) {
      const nameParts = jellyfinUser.Name.split(' ');
      setFormData(prev => ({
        ...prev,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: jellyfinUser.Email || `${jellyfinUser.Name}@jellyfin.local`
      }));
    }
  }, [jellyfinUser]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = t('first_name_required');
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = t('last_name_required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('email_required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalid_email');
    }

    if (!formData.password) {
      newErrors.password = t('password_required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('password_min_length');
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = t('passwords_not_match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !jellyfinUser) {
      return;
    }

    setLoading(true);
    try {
      // Appeler la fonction Edge pour créer le compte utilisateur
      const { data, error } = await supabase.functions.invoke('import-jellyfin-users', {
        body: {
          jellyfin_user_id: jellyfinUser.Id,
          jellyfin_username: jellyfinUser.Name,
          jellyfin_name: jellyfinUser.Name,
          password: formData.password
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      showSuccess(t('account_created_successfully'));
      onClose();
      
      // Rediriger vers la page de connexion ou connecter automatiquement
      window.location.href = '/auth/signin';
      
    } catch (error: any) {
      console.error('Erreur lors de la création du compte:', error);
      showError(error.message || t('error_creating_account'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!jellyfinUser) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>{t('welcome_jellyfin_user')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('welcome_jellyfin_user_desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations Jellyfin */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">{t('jellyfin_account')}</span>
                </div>
                <Badge variant="secondary">{jellyfinUser.Id}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {jellyfinUser.Name}
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t('first_name')}</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder={t('enter_first_name')}
                  className={errors.first_name ? 'border-red-500' : ''}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.first_name}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">{t('last_name')}</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder={t('enter_last_name')}
                  className={errors.last_name ? 'border-red-500' : ''}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.last_name}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t('enter_email')}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={t('enter_password')}
                  className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">{t('confirm_password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                  placeholder={t('confirm_password')}
                  className={`pl-10 ${errors.confirm_password ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.confirm_password}</span>
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">
                {t('account_creation_info')}
              </p>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? t('creating_account') : t('create_account')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JellyfinWelcomeModal;
