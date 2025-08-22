import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Clapperboard, Smartphone, Users } from 'lucide-react';
import CommunitySection from '@/components/widgets/CommunitySection';
import FeaturedMedia from '@/components/home/FeaturedMedia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Clapperboard className="h-8 w-8 text-blue-400" />,
      title: "Un catalogue infini",
      description: "Découvrez des milliers de films, séries et animés. De nouveaux contenus sont ajoutés chaque semaine pour ne jamais être à court de nouveautés."
    },
    {
      icon: <Smartphone className="h-8 w-8 text-blue-400" />,
      title: "Disponible partout",
      description: "Accédez à vos contenus préférés sur tous vos appareils : TV, ordinateur, tablette ou smartphone. Votre divertissement vous suit partout."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-400" />,
      title: "Une communauté active",
      description: "Rejoignez notre Discord pour discuter, faire des demandes de contenu et participer à la vie du service. Votre avis compte !"
    }
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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            {t('hero_title')}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            {t('hero_subtitle')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/catalog">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300">
                Explorer le catalogue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/status">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-gray-600 hover:bg-gray-800/50 hover:text-white font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300">
                {t('cta_status')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Section Fonctionnalités */}
      <div className="relative z-10 w-full py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: "easeInOut" }}
              >
                <Card className="bg-gray-800/50 border-gray-700/50 text-center h-full">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Section Médias en vedette */}
      <div className="relative z-10 w-full py-16">
        <FeaturedMedia />
      </div>

      {/* Section Communauté */}
      <div className="relative z-10 w-full py-16 bg-gray-900/50">
        <CommunitySection />
      </div>
    </div>
  );
};

export default Index;