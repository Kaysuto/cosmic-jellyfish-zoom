import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import JellyfinSettings from '@/components/admin/JellyfinSettings';
import WebhookInstructions from '@/components/admin/WebhookInstructions';

const JellyfinAdminPage = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('jellyfin_tab_title')}</h1>
        <p className="text-muted-foreground">{t('jellyfin_tab_desc')}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <JellyfinSettings />
        <WebhookInstructions />
      </div>
    </motion.div>
  );
};

export default JellyfinAdminPage;