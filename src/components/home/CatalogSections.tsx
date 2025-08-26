import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Film, 
  Tv, 
  PlayCircle, 
  Sparkles,
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CatalogSection {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const CatalogSections = () => {
  const { t } = useTranslation();

  const sections: CatalogSection[] = [
    {
      id: 'animations',
      name: t('catalog_section_animations'),
      description: t('catalog_section_animations_desc'),
      icon: <Sparkles className="h-8 w-8" />,
      path: '/discover/animations',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'animes',
      name: t('catalog_section_animes'),
      description: t('catalog_section_animes_desc'),
      icon: <PlayCircle className="h-8 w-8" />,
      path: '/discover/animes',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'films',
      name: t('catalog_section_films'),
      description: t('catalog_section_films_desc'),
      icon: <Film className="h-8 w-8" />,
      path: '/discover/films',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'series',
      name: t('catalog_section_series'),
      description: t('catalog_section_series_desc'),
      icon: <Tv className="h-8 w-8" />,
      path: '/discover/series',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="w-full py-16 bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('explore_catalog_sections')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('catalog_sections_description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section, index) => (
            <Card key={section.id} className="h-full bg-card border hover:bg-accent/5 transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {section.icon}
                  </div>
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                  {section.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4 group-hover:text-foreground/80 transition-colors duration-300">
                  {section.description}
                </p>
                <Link to={section.path}>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                  >
                    {t('explore_section')}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogSections;
