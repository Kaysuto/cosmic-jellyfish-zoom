import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import MediaGrid from '../components/catalog/MediaGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Film, Tv, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useDebounce } from '@/hooks/useDebounce';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CatalogFilters from '../components/catalog/CatalogFilters';

interface Filter {
  id: number;
  name: string;
  type: 'genre' | 'keyword';
}

const CatalogPage = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [discoverMedia, setDiscoverMedia] = useState([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [mediaType, setMediaType] = useState<'movie' | 'tv' | 'anime'>('movie');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('popularity.desc');

  const fetchFilters = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-genres', {
        body: { mediaType, language: i18n.language },
      });
      if (error) throw error;
      setFilters(data);
    } catch (error: any) {
      showError(error.message);
    }
  }, [mediaType, i18n.language]);

  const fetchDiscoverMedia = useCallback(async (currentPage, shouldAppend = false) => {
    setDiscoverLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('discover-media', {
        body: {
          mediaType,
          language: i18n.language,
          page: currentPage,
          sortBy,
          genres: selectedGenreIds.join(','),
          keywords: selectedKeywordIds.join(','),
        },
      });
      if (error) throw error;
      setDiscoverMedia(prev => shouldAppend ? [...prev, ...data.results] : data.results);
      setTotalPages(data.total_pages);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setDiscoverLoading(false);
    }
  }, [mediaType, i18n.language, sortBy, selectedGenreIds, selectedKeywordIds]);

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

  useEffect(() => {
    if (!debouncedSearchTerm) {
      fetchDiscoverMedia(page, page > 1);
    }
  }, [page, debouncedSearchTerm, fetchDiscoverMedia]);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setPage(1);
      fetchDiscoverMedia(1, false);
    }
  }, [sortBy, selectedGenreIds, selectedKeywordIds, debouncedSearchTerm, fetchDiscoverMedia]);

  useEffect(() => {
    fetchFilters();
    setSelectedGenreIds([]);
    setSelectedKeywordIds([]);
    setSortBy('popularity.desc');
    setPage(1);
  }, [mediaType, i18n.language]);

  const handleFilterToggle = (id: number, type: 'genre' | 'keyword') => {
    if (type === 'genre') {
      setSelectedGenreIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setSelectedKeywordIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
  };

  const handleResetFilters = () => {
    setSelectedGenreIds([]);
    setSelectedKeywordIds([]);
    setSortBy('popularity.desc');
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <MediaGrid items={searchResults} />
          ) : (
            <p className="text-center text-muted-foreground py-8">{t('no_results_found')}</p>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <aside className="lg:col-span-1 lg:sticky lg:top-24">
            <CatalogFilters
              filters={filters}
              selectedGenres={selectedGenreIds}
              selectedKeywords={selectedKeywordIds}
              onFilterToggle={handleFilterToggle}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onReset={handleResetFilters}
            />
          </aside>
          <div className="lg:col-span-3">
            <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as any)} className="mb-8">
              <TabsList>
                <TabsTrigger value="movie"><Film className="mr-2 h-4 w-4" />{t('movie')}</TabsTrigger>
                <TabsTrigger value="tv"><Tv className="mr-2 h-4 w-4" />{t('tv_show')}</TabsTrigger>
                <TabsTrigger value="anime"><Flame className="mr-2 h-4 w-4" />{t('anime')}</TabsTrigger>
              </TabsList>
            </Tabs>
            {discoverLoading && page === 1 ? <LoadingSkeleton /> : <MediaGrid items={discoverMedia} />}
            {page < totalPages && !discoverLoading && (
              <div className="text-center mt-8">
                <Button onClick={() => setPage(p => p + 1)}>{t('load_more')}</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;