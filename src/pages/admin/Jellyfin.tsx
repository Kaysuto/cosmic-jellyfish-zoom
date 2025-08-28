import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Server, Film, Tv, Users } from 'lucide-react';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import JellyfinSettings from '@/components/admin/JellyfinSettings';
import Webhooks from '@/components/admin/Webhooks';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const JellyfinPage = () => {
  const { t } = useTranslation();
  const { serverInfo, libraryInfo, users, error } = useJellyfin();

  const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-muted rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <motion.div
        className="container mx-auto px-4 py-8 space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-500">{t('error')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t('jellyfin_error_check_settings')}</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <JellyfinSettings />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8 space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header principal */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{serverInfo?.ServerName || t('jellyfin_server')}</CardTitle>
                <p className="text-sm text-muted-foreground">{t('version')} {serverInfo?.Version}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-500">{t('operational')}</span>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Section 1: Statistiques et médias */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{t('overview')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title={t('movies')} value={libraryInfo?.movieCount || 0} icon={Film} />
            <StatCard title={t('tv_shows')} value={libraryInfo?.seriesCount || 0} icon={Tv} />
            <StatCard title={t('users')} value={users?.length || 0} icon={Users} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 2: Gestion des utilisateurs */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{t('manage_users')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{t('jellyfin_users_list_desc')}</p>
            <div className="flex flex-wrap gap-2">
              {users?.map(user => (
                <div key={user.Id} className="px-3 py-1 bg-muted rounded-full text-sm">
                  {user.Name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 3: Configuration et webhooks */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <JellyfinSettings />
        {/* Webhooks */}
        <Webhooks />
      </motion.div>
    </motion.div>
  );
};

export default JellyfinPage;