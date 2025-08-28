import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Film, 
  Tv, 
  PlayCircle, 
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CatalogSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  borderColor: string;
}

const CatalogSections = () => {
  const { t } = useTranslation();

  const sections: CatalogSection[] = [
    {
      id: 'animations',
      name: t('catalog_sections.animations'),
      icon: <Sparkles className="h-8 w-8" />,
      path: '/discover/animations',
      color: 'from-purple-500 to-pink-500',
      borderColor: 'hover:border-pink-500/50'
    },
    {
      id: 'animes',
      name: t('catalog_sections.animes'),
      icon: <PlayCircle className="h-8 w-8" />,
      path: '/discover/animes',
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'hover:border-cyan-500/50'
    },
    {
      id: 'films',
      name: t('catalog_sections.films'),
      icon: <Film className="h-8 w-8" />,
      path: '/discover/films',
      color: 'from-orange-500 to-red-500',
      borderColor: 'hover:border-red-500/50'
    },
    {
      id: 'series',
      name: t('catalog_sections.series'),
      icon: <Tv className="h-8 w-8" />,
      path: '/discover/series',
      color: 'from-green-500 to-emerald-500',
      borderColor: 'hover:border-emerald-500/50'
    }
  ];

  return (
    <div className="w-full py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('catalog_sections.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('catalog_sections.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: "easeInOut" }}
            >
              <Link to={section.path} className="group block h-full">
                <div className={cn(
                  "h-full p-6 text-center flex flex-col items-center justify-center rounded-xl",
                  "bg-gray-800/50 backdrop-blur-sm border border-gray-700/50",
                  "transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl",
                  section.borderColor
                )}>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {section.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white transition-colors duration-300">
                    {section.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogSections;