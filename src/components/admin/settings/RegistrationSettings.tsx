import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';
import { Shield } from 'lucide-react';
import { useSession } from '@/contexts/AuthContext';
import { AppSetting } from '@/contexts/SettingsContext';

interface RegistrationSettingsProps {
  settings: AppSetting[];
  loading: boolean;
  onUpdate: () => void;
}

const RegistrationSettings = ({ settings, loading, onUpdate }: RegistrationSettingsProps) => {
  const { t } = useTranslation();
  const { session } = useSession();
  const [allowRegistrations, setAllowRegistrations] = useState(true);

  useEffect(() => {
    if (!loading) {
      const registrationSetting = settings.find(s => s.key === 'allow_registrations');
      setAllowRegistrations(registrationSetting ? registrationSetting.value === 'true' : true);
    }
  }, [loading, settings]);

  const handleRegistrationToggle = async (checked: boolean) => {
    if (!session?.user) return;
    const originalState = allowRegistrations;
    setAllowRegistrations(checked);
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'allow_registrations', value: checked.toString() }, { onConflict: 'key' });

    if (error) {
      showError(t('error_updating_setting'));
      setAllowRegistrations(originalState);
    } else {
      showSuccess(t(checked ? 'registrations_enabled' : 'registrations_disabled'));
      await supabase.from('audit_logs').insert({ user_id: session.user.id, action: 'setting_updated', details: { key: 'allow_registrations', value: checked.toString() } });
      onUpdate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />{t('registration_settings')}</CardTitle>
        <CardDescription>{t('allow_new_registrations_desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-6 w-52" /> : (
          <div className="flex items-center space-x-2">
            <Switch id="allow-registrations" checked={allowRegistrations} onCheckedChange={handleRegistrationToggle} />
            <Label htmlFor="allow-registrations">{t('allow_new_registrations')}</Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegistrationSettings;