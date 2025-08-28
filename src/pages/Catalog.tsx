import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Film, Tv, Video } from 'lucide-react';
import { useSession } from '@/contexts/AuthContext';
import { useJellyfin } from '@/contexts/JellyfinContext';
import JellyfinLibrarySection from '@/components/catalog/JellyfinLibrarySection';
import PopularMediaSection from '@/components/catalog/PopularMediaSection';

const Catalog = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    { name: t('catalog_section_films'), desc: t('catalog_section_films_desc'), icon: Film, path: '/discover/films' },
    { name: t('catalog_section_series'), desc: t('catalog_section_series_desc'), icon: Tv, path: '/discover/series' },
    { name: t('catalog_section_animes'), desc: t('catalog_section_animes_desc'), icon: Video, path: '/discover/animes' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">{t('catalog_title')}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t('catalog_description')}</p>
      </header>

      {/* Search and Request */}
      <Card>
        <CardHeader>
          <CardTitle>{t('search_and_request')}</CardTitle>
          <CardDescription>{t('search_and_request_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-lg mx-auto items-center space-x-2">
            <Input
              type="search"
              placeholder={t('search_in_catalog')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button asChild>
              <Link to={`/search?q=${encodeURIComponent(searchTerm)}`}>
                <Search className="mr-2 h-4 w-4" /> {t('search')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jellyfin Sections */}
      {!jellyfinError && !jellyfinLoading && jellyfinUrl && (
        <>
          <JellyfinLibrarySection title={t('latest_additions_movies')} endpoint="Items/Latest" itemType="Movie" />
          <JellyfinLibrarySection title={t('latest_additions_series')} endpoint="Items/Latest" itemType="Series" />
        </>
      )}

      {/* Popular Media Sections */}
      <PopularMediaSection title={t('popular_movies')} mediaType="movie" />
      <PopularMediaSection title={t('popular_tv_shows')} mediaType="tv" />

      {/* Discover Sections */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-6">{t('explore_catalog_sections')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Link to={section.path} key={section.name}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <section.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{section.name}</CardTitle>
                      <CardDescription>{section.desc}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Catalog;