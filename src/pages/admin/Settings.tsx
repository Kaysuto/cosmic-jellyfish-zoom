import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/contexts/SettingsContext';
import { motion } from 'framer-motion';
import GeneralSettingsForm from '@/components/admin/settings/GeneralSettingsForm';
import RegistrationSettings from '@/components/admin/settings/RegistrationSettings';

const Settings = () => {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const { settings, loading: settingsLoading, refreshSettings } = useSettings();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
          <p className="text-muted-foreground">{t('settings_description')}</p>
        </div>

        {profile?.role === 'admin' && (
          <>
            <GeneralSettingsForm 
              settings={settings} 
              loading={settingsLoading} 
              onUpdate={refreshSettings} 
            />
            <RegistrationSettings 
              settings={settings} 
              loading={settingsLoading} 
              onUpdate={refreshSettings} 
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Settings;