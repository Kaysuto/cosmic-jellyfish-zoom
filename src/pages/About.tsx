import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Heart, Rocket, Clapperboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
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
            À propos de Jelly
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Votre univers de divertissement, façonné par un passionné.
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none text-muted-foreground space-y-8">
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-gray-800/50 rounded-lg">
            <Rocket className="h-16 w-16 text-blue-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-white mt-0">La Mission</h2>
              <p>
                La mission de ce projet est simple : offrir un accès simple, rapide et centralisé à un vaste catalogue de films, séries et animés. Je crois que le divertissement doit être accessible sans contraintes, sur n'importe quel appareil, n'importe quand. Jelly est né de cette passion pour le cinéma et la technologie, avec l'ambition de créer la meilleure expérience de streaming possible.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-gray-800/50 rounded-lg">
            <Heart className="h-16 w-16 text-red-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-white mt-0">Un Projet Passionné</h2>
              <p>
                Je suis un développeur passionné qui consacre son temps libre à créer et améliorer ce service. Chaque fonctionnalité, chaque amélioration est pensée pour répondre à vos besoins. Ce n'est pas une grande entreprise, mais un projet personnel mené avec passion.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-gray-800/50 rounded-lg">
            <Users className="h-16 w-16 text-green-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-white mt-0">Rejoignez la Communauté</h2>
              <p>
                Jelly est plus qu'un simple service, c'est une communauté d'utilisateurs. Votre avis est essentiel pour m'aider à faire grandir le projet. Rejoignez-nous sur Discord pour discuter, suggérer de nouvelles fonctionnalités, ou simplement partager vos derniers coups de cœur cinématographiques.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <Link to="/catalog">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300 px-8 py-6 text-lg">
              <Clapperboard className="mr-3 h-6 w-6" />
              Explorer le Catalogue
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;