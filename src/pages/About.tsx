import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Heart, Rocket } from 'lucide-react';

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
            À propos du Projet Jelly
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Votre univers de divertissement, façonné par la communauté.
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none text-muted-foreground space-y-8">
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-gray-800/50 rounded-lg">
            <Rocket className="h-16 w-16 text-blue-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-white mt-0">Notre Mission</h2>
              <p>
                Notre mission est simple : offrir un accès simple, rapide et centralisé à un vaste catalogue de films, séries et animés. Nous croyons que le divertissement doit être accessible sans contraintes, sur n'importe quel appareil, n'importe quand. Le Projet Jelly est né de cette passion pour le cinéma et la technologie, avec l'ambition de créer la meilleure expérience de streaming possible.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-gray-800/50 rounded-lg">
            <Heart className="h-16 w-16 text-red-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-white mt-0">Fait par des passionnés, pour des passionnés</h2>
              <p>
                Nous sommes une équipe de développeurs, de cinéphiles et de membres de la communauté qui consacrent leur temps libre à améliorer ce service. Chaque fonctionnalité, chaque amélioration est pensée pour répondre aux besoins réels des utilisateurs. Nous ne sommes pas une grande entreprise, mais une communauté unie par la même passion.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-gray-800/50 rounded-lg">
            <Users className="h-16 w-16 text-green-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-white mt-0">Rejoignez l'aventure</h2>
              <p>
                Le Projet Jelly est plus qu'un simple service, c'est une communauté. Votre avis est essentiel pour nous aider à grandir. Rejoignez-nous sur Discord pour discuter, suggérer de nouvelles fonctionnalités, ou simplement partager vos derniers coups de cœur cinématographiques.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;