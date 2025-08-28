import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Cog, Users, Shield, UserCheck, Mail } from 'lucide-react';

const PrivacyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            {t('privacy_title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('privacy_subtitle')}
          </p>
        </div>

        <div className="space-y-8">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Database className="h-6 w-6 text-blue-400" />
                {t('privacy_data_collection_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                {t('privacy_data_collection_desc')}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('privacy_account_info')}</li>
                <li>{t('privacy_usage_data')}</li>
                <li>{t('privacy_content_requests')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Cog className="h-6 w-6 text-green-400" />
                {t('privacy_data_usage_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                {t('privacy_data_usage_desc')}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('privacy_usage_1')}</li>
                <li>{t('privacy_usage_2')}</li>
                <li>{t('privacy_usage_3')}</li>
                <li>{t('privacy_usage_4')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Users className="h-6 w-6 text-yellow-400" />
                {t('privacy_sharing_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                {t('privacy_sharing_desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Shield className="h-6 w-6 text-purple-400" />
                {t('privacy_security_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                {t('privacy_security_desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <UserCheck className="h-6 w-6 text-teal-400" />
                {t('privacy_rights_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                {t('privacy_rights_desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Mail className="h-6 w-6 text-red-400" />
                {t('privacy_contact_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                {t('privacy_contact_desc')} <a href="mailto:contact@playjelly.fr" className="text-blue-400 hover:underline font-semibold">contact@playjelly.fr</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPage;