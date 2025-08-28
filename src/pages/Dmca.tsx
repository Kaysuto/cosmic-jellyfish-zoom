import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mail, Shield } from 'lucide-react';

const DmcaPage = () => {
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
            {t('dmca_title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('dmca_subtitle')}
          </p>
        </div>

        <div className="space-y-8">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Shield className="h-6 w-6 text-blue-400" />
                {t('dmca_important_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                {t('dmca_important_desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <FileText className="h-6 w-6 text-green-400" />
                {t('dmca_notification_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                {t('dmca_notification_desc')}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('dmca_requirement_1')}</li>
                <li>{t('dmca_requirement_2')}</li>
                <li>{t('dmca_requirement_3')}</li>
                <li>{t('dmca_requirement_4')}</li>
                <li>{t('dmca_requirement_5')}</li>
                <li>{t('dmca_requirement_6')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Mail className="h-6 w-6 text-red-400" />
                {t('dmca_contact_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                {t('dmca_contact_desc')}
              </p>
              <p className="text-lg">
                <strong>{t('dmca_contact_email')}</strong> <a href="mailto:contact@playjelly.fr" className="text-blue-400 hover:underline font-semibold">contact@playjelly.fr</a>
              </p>
              <p>
                {t('dmca_contact_final')}
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default DmcaPage;