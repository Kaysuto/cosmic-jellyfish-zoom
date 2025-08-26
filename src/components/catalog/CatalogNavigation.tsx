import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Film, 
  Tv, 
  PlayCircle, 
  Sparkles,
  ChevronRight 
} from 'lucide-react';

interface CatalogSection {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const CatalogNavigation = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const sections: CatalogSection[] = [
    {
      id: 'animations',
      name: t('catalog_section_animations'),
      description: t('catalog_section_animations_desc'),
      icon: <Sparkles className="h-5 w-5" />,
      path: '/discover/animations'
    },
    {
      id: 'animes',
      name: t('catalog_section_animes'),
      description: t('catalog_section_animes_desc'),
      icon: <PlayCircle className="h-5 w-5" />,
      path: '/discover/animes'
    },
    {
      id: 'films',
      name: t('catalog_section_films'),
      description: t('catalog_section_films_desc'),
      icon: <Film className="h-5 w-5" />,
      path: '/discover/films'
    },
    {
      id: 'series',
      name: t('catalog_section_series'),
      description: t('catalog_section_series_desc'),
      icon: <Tv className="h-5 w-5" />,
      path: '/discover/series'
    }
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('catalog_title')}</h1>
        <p className="text-muted-foreground">{t('catalog_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) => {
          const isActive = location.pathname === section.path;
          
          return (
            <Link key={section.id} to={section.path}>
              <Button
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "w-full h-auto p-6 flex flex-col items-start gap-3 text-left transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "hover:bg-muted/50 hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isActive ? "bg-primary-foreground/20" : "bg-muted"
                  )}>
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{section.name}</h3>
                    <p className={cn(
                      "text-sm mt-1",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    isActive ? "text-primary-foreground/60" : "text-muted-foreground"
                  )} />
                </div>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CatalogNavigation;