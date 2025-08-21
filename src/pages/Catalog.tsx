import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAvailableMedia } from '@/hooks/useAvailableMedia';
import { Skeleton } from '@/components/ui/skeleton';
import MediaGrid from '../components/catalog/MediaGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useDebounce } from '@/hooks/useDebounce';

const CatalogPage = () => {
  const { t, i18n } = useTranslation();
  const { media: availableMedia, loading: catalogLoading } = useAvailableMedia();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const handleSearch = async () => {
        setSearchLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke('search-media', {
            body: { query: debouncedSearchTerm, mediaType: 'multi', language: i18n.language },
          });
          if (error) throw error;
          setSearchResults(data.filter((item: any) => item.media_type !== 'person'));
        } catch (error: any) {
          showError(error.message);
        } finally {
          setSearchLoading(false);
        }
      };
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, i18n.language]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  const isSearching = debouncedSearchTerm.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{t('catalog')}</h1>
        <p className="text-muted-foreground">{t('catalog_description')}</p>
      </div>
      
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('search_for_media')}
          className="pl-10"
        />
        {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
      </div>

      {isSearching ? (
        <>
          <h2 className="text-2xl font-bold mb-4">{t('search_results')}</h2>
          {searchLoading && searchResults.length === 0 ? (
            <LoadingSkeleton />
          ) : searchResults.length > 0 ? (
            <MediaGrid items={searchResults} viewType="search" />
          ) : (
            <p className="text-center text-muted-foreground py-8">{t('no_results_found')}</p>
          )}
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">{t('available_in_catalog')}</h2>
          {catalogLoading ? <LoadingSkeleton /> : <MediaGrid items={availableMedia} viewType="catalog" />}
        </>
      )}
    </div>
  );
};

export default CatalogPage;