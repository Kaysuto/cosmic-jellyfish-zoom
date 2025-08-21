import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Tv, CheckCircle, Users } from 'lucide-react';
import CommunitySection from '@/components/widgets/CommunitySection';

const Index = () => {
  const { t } = useTranslation();

  const featureCards = [
    {
      icon: <CheckCircle className="h-8 w-8 text-green-400" />,
      title: t('feature_1_title'),
      description: t('feature_1_desc'),
    },
    {
      icon: <Tv className="h-8 w-8 text-blue-400" />,
      title: t('feature_2_title'),
      description: t('feature_2_desc'),
    },
    {
      icon: <Users className="h-8 w-8 text-purple-400" />,
      title: t('feature_3_title'),
      description: t('feature_3_desc'),
    },
  ];

  return (
    <div className="relative flex-grow w-full overflow-hidden bg-gray-900 text-white flex flex-col">
      {/* Fond animé */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-transparent to-gray-900 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow text-center px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            {t('hero_title')}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            {t('hero_subtitle')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/status">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300">
                {t('cta_status')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/requests">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-gray-600 hover:bg-gray-800/50 hover:text-white font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300">
                {t('cta_requests')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Section Fonctionnalités */}
      <div className="relative z-10 w-full py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('features_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featureCards.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50 text-center"
              >
                <div className="inline-block p-4 bg-gray-700/50 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Communauté */}
      <div className="relative z-10 w-full py-16">
        <CommunitySection />
      </div>
    </div>
  );
};

export default Index;