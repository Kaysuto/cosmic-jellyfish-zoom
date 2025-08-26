import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import MediaGrid, { MediaItem } from '../components/catalog/MediaGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent } from '@/components/ui/card';
import { useSession } from '@/contexts/AuthContext';
import ContinueWatching from '@/components/catalog/ContinueWatching';
import JellyfinLibrarySection from '@/components/catalog/JellyfinLibrarySection';
import NextUpSection from '@/components/catalog/NextUpSection';
import { useJellyfin } from '@/contexts/JellyfinContext';

interface JellyfinLibrary {
  id: string;
  name: string;
  collectionType: string;
}

const CatalogPage = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const { jellyfinUrl, loading: jellyfinLoading, error: jellyfinError } = useJellyfin();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [jellyfinLibraries, setJellyfinLibraries] = useState<JellyfinLibrary[]>([]);
  const [librariesLoading, setLibrariesLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchJellyfinLibraries = useCallback(async () => {
    if (!jellyfinUrl) {
      setLibrariesLoading(false);
      return;
    }

    try {
      const { data: librariesData, error: librariesError } = await supabase.functions.invoke('get-jellyfin-libraries');
      if (librariesError) throw librariesError;
      setJellyfinLibraries(librariesData || []);
    } catch (error: any) {
      console.error('Error fetching Jellyfin libraries:', error);
    } finally {
      setLibrariesLoading(false);
    }
  }, [jellyfinUrl]);

  useEffect(() => {
    fetchJellyfinLibraries();
  }, [fetchJellyfinLibraries]);

  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-media', {
        body: { query: term, language: i18n.language },
      });
      if (error) throw error;
      setSearchResults(data.results || []);
    } catch (error: any) {
      showError(error.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

  useEffect(() => {
    handleSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, handleSearch]);

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      <main>
        {debouncedSearchTerm ? (
          loading ? <LoadingSkeleton /> : (
            searchResults.length > 0 ? (
              <MediaGrid items={searchResults} showRequestButton={!!session} searchTerm={debouncedSearchTerm} />
            ) : (
              <Card><CardContent><p className="text-center text-muted-foreground py-8">{t('no_results_found')}</p></CardContent></Card>
            )
          )
        ) : (
          <div className="space-y-12">
            <ContinueWatching />
            <NextUpSection />
            
            {/* Bibliothèques Jellyfin */}
            {librariesLoading ? (
              <>
                <Skeleton className="h-8 w-1/4 mb-4" />
                <div className="flex space-x-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-[16.66%] flex-shrink-0">
                      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              jellyfinLibraries.map(library => (
                <JellyfinLibrarySection key={library.id} library={library} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CatalogPage;