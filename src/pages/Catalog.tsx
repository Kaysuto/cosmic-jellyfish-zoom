import { useState, useEffect } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Film, Tv, Video } from 'lucide-react';
import { useSession } from '@/contexts/AuthContext';
import { useJellyfin } from '@/contexts/JellyfinContext';
import JellyfinLibrarySection from '@/components/catalog/JellyfinLibrarySection';
import PopularMediaSection from '@/components/catalog/PopularMediaSection';
import CatalogSections from '@/components/home/CatalogSections';
import ContinueWatching from '@/components/catalog/ContinueWatching';
import WatchlistSection from '@/components/catalog/WatchlistSection';
import { useDebounce } from '@/hooks/useDebounce';

const Catalog = () => {
  const { t } = useSafeTranslation();
  const { session } = useSession();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Debounce le terme de recherche pour éviter les redirections trop fréquentes
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Rediriger automatiquement vers la page de recherche quand l'utilisateur tape
  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
      navigate(`/catalog/search?q=${encodeURIComponent(debouncedSearchTerm.trim())}`);
    }
  }, [debouncedSearchTerm, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalog/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">{t('catalog_title')}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t('catalog_description')}</p>
      </header>

      {/* Search */}
      <div className="flex justify-center">
        <div className="w-full max-w-lg">
          <form onSubmit={handleSearch}>
            <Input
              type="search"
              placeholder={t('search_in_catalog')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </form>
        </div>
      </div>

      {/* Catalog Sections */}
      <CatalogSections />

      {/* Jellyfin Sections */}
      {!jellyfinError && !jellyfinLoading && jellyfinUrl && (
        <>
          <JellyfinLibrarySection title={t('latest_additions_movies')} endpoint="Items/Latest" itemType="Movie" />
          <JellyfinLibrarySection title={t('latest_additions_series')} endpoint="Items/Latest" itemType="Series" />
        </>
      )}

      {/* Watchlist Section */}
      <WatchlistSection />

      {/* Continue Watching Section */}
      <ContinueWatching />

      {/* Popular Media Sections */}
      <PopularMediaSection 
        title={t('popular_movies')} 
        mediaType="movie" 
        maxItems={10}
        showViewMore={true}
      />
      <PopularMediaSection 
        title={t('popular_tv_shows')} 
        mediaType="tv" 
        maxItems={10}
        showViewMore={true}
      />
      <PopularMediaSection 
        title={t('popular_animes')} 
        mediaType="anime" 
        maxItems={10}
        showViewMore={true}
      />
    </div>
  );
};

export default Catalog;