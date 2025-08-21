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

  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('popularity.desc');

  const fetchGenres = useCallback(async () => {
    const apiMediaType = mediaType === 'anime' ? 'tv' : mediaType;
    try {
      const { data, error } = await supabase.functions.invoke('get-genres', {
        body: { mediaType: apiMediaType, language: i18n.language },
      });
      if (error) throw error;
      setGenres(data);
    } catch (error: any) {
      showError(error.message);
    }
  }, [mediaType, i18n.language]);

  const fetchDiscoverMedia = useCallback(async () => {
    if (debouncedSearchTerm) return;
    setDiscoverLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('discover-media', {
        body: {
          mediaType,
          language: i18n.language,
          page,
          sortBy,
          genres: selectedGenres.join(','),
        },
      });
      if (error) throw error;
      setDiscoverMedia(data.results);
      setTotalPages(Math.min(data.total_pages, 500)); // TMDB API has a 500 page limit
    } catch (error: any) {
      showError(error.message);
    } finally {
      setDiscoverLoading(false);
    }
  }, [debouncedSearchTerm, mediaType, i18n.language, page, sortBy, selectedGenres]);

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
    fetchDiscoverMedia();
  }, [fetchDiscoverMedia]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  const handleMediaTypeChange = (value: 'movie' | 'tv' | 'anime') => {
    setMediaType(value);
    setSelectedGenres([]);
    setSortBy('popularity.desc');
    setPage(1);
  };

  const handleGenreToggle = (genreId: number) => {
    setPage(1);
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };
  
  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedGenres([]);
    setSortBy('popularity.desc');
    setPage(1);
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

  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          {t('previous')}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t('page_x_of_y', { x: page, y: totalPages })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          {t('next')}
        </Button>
      </div>
    );
  };

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
              genres={genres}
              selectedGenres={selectedGenres}
              onGenreToggle={handleGenreToggle}
              sortBy={sortBy}
              onSortByChange={handleSortByChange}
              onReset={handleResetFilters}
            />
          </aside>
          <div className="lg:col-span-3">
            <Tabs value={mediaType} onValueChange={handleMediaTypeChange} className="mb-8">
              <TabsList>
                <TabsTrigger value="movie"><Film className="mr-2 h-4 w-4" />{t('movie')}</TabsTrigger>
                <TabsTrigger value="tv"><Tv className="mr-2 h-4 w-4" />{t('tv_show')}</TabsTrigger>
                <TabsTrigger value="anime"><Flame className="mr-2 h-4 w-4" />{t('anime')}</TabsTrigger>
              </TabsList>
            </Tabs>
            {discoverLoading ? <LoadingSkeleton /> : <MediaGrid items={discoverMedia} />}
            {!discoverLoading && <PaginationControls />}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;