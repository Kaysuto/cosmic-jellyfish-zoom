import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import MediaGrid, { MediaItem } from '../components/catalog/MediaGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useDebounce } from '@/hooks/useDebounce';
import CatalogFilters from '../components/catalog/CatalogFilters';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import RequestModal from '@/components/catalog/RequestModal';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/contexts/AuthContext';

const popularStudios = [
  { id: 2, name: 'Walt Disney Pictures' },
  { id: 3, name: 'Pixar' },
  { id: 420, name: 'Marvel Studios' },
  { id: 174, name: 'Warner Bros. Pictures' },
  { id: 33, name: 'Universal Pictures' },
  { id: 4, name: 'Paramount' },
  { id: 5, name: 'Columbia Pictures' },
  { id: 25, name: '20th Century Studios' },
];

const popularNetworks = [
  { id: 213, name: 'Netflix' },
  { id: 49, name: 'HBO' },
  { id: 2739, name: 'Disney+' },
  { id: 1024, name: 'Amazon' },
  { id: 453, name: 'Hulu' },
  { id: 1957, name: 'Crunchyroll' },
  { id: 4, name: 'BBC One' },
  { id: 2, name: 'ABC' },
];

const CatalogPage = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 450);
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [discoverMedia, setDiscoverMedia] = useState<any[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [mediaType, setMediaType] = useState<'movie' | 'tv' | 'anime'>('movie');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('popularity.desc');

  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedStudios, setSelectedStudios] = useState<number[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<number[]>([]);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setSearchParams({ q: debouncedSearchTerm });
    } else {
      searchParams.delete('q');
      setSearchParams(searchParams);
    }
  }, [debouncedSearchTerm, setSearchParams]);

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
          studios: selectedStudios.join(','),
          networks: selectedNetworks.join(','),
        },
      });
      if (error) throw error;
      
      setDiscoverMedia(data.results);
      
      const totalApiPages = Math.min(data.total_pages ?? 1, 500);
      setTotalPages(totalApiPages);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setDiscoverLoading(false);
    }
  }, [debouncedSearchTerm, mediaType, i18n.language, page, selectedGenres, selectedStudios, selectedNetworks, sortBy]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const handleSearch = async () => {
        setSearchLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke('search-media', {
            body: { query: debouncedSearchTerm, mediaType: 'multi', language: i18n.language },
          });
          if (error) throw error;
          setSearchResults(data);
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

  const resetAndFetch = () => {
    setPage(1);
    setDiscoverMedia([]);
  };

  const handleMediaTypeChange = (value: 'movie' | 'tv' | 'anime') => {
    setMediaType(value);
    setSelectedGenres([]);
    setSelectedStudios([]);
    setSelectedNetworks([]);
    resetAndFetch();
  };

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
    resetAndFetch();
  };

  const handleStudioToggle = (studioId: number) => {
    setSelectedStudios(prev =>
      prev.includes(studioId)
        ? prev.filter(id => id !== studioId)
        : [...prev, studioId]
    );
    resetAndFetch();
  };

  const handleNetworkToggle = (networkId: number) => {
    setSelectedNetworks(prev =>
      prev.includes(networkId)
        ? prev.filter(id => id !== networkId)
        : [...prev, networkId]
    );
    resetAndFetch();
  };
  
  const handleResetFilters = () => {
    setSelectedGenres([]);
    setSelectedStudios([]);
    setSelectedNetworks([]);
    setSortBy('popularity.desc');
    resetAndFetch();
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    resetAndFetch();
  };

  const handleFilterToggle = (type: 'genre' | 'studio' | 'network', id: number) => {
    if (type === 'genre') handleGenreToggle(id);
    if (type === 'studio') handleStudioToggle(id);
    if (type === 'network') handleNetworkToggle(id);
  };

  const activeFilters = [
    ...selectedGenres.map(id => ({ id, name: genres.find(g => g.id === id)?.name, type: 'genre' as const })),
    ...selectedStudios.map(id => ({ id, name: popularStudios.find(s => s.id === id)?.name, type: 'studio' as const })),
    ...selectedNetworks.map(id => ({ id, name: popularNetworks.find(n => n.id === id)?.name, type: 'network' as const }))
  ].filter(f => f.name);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  const isSearching = debouncedSearchTerm.length > 0;

  const openRequestModal = (item: MediaItem) => {
    setSelectedItemForRequest(item);
    setRequestModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{t('catalog')}</h1>
        <p className="text-muted-foreground">{t('catalog_description')}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_for_media')}
            className="pl-10"
          />
          {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </div>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {t('filter')}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px]">
              <SheetHeader><SheetTitle>{t('filter')}</SheetTitle><SheetDescription>Affinez votre recherche</SheetDescription></SheetHeader>
              <div className="py-4">
                <CatalogFilters 
                  genres={genres} 
                  selectedGenres={selectedGenres} 
                  onGenreToggle={handleGenreToggle} 
                  onReset={handleResetFilters}
                  mediaType={mediaType}
                  onMediaTypeChange={handleMediaTypeChange}
                  studios={popularStudios}
                  selectedStudios={selectedStudios}
                  onStudioToggle={handleStudioToggle}
                  networks={popularNetworks}
                  selectedNetworks={selectedNetworks}
                  onNetworkToggle={handleNetworkToggle}
                  sortBy={sortBy}
                  onSortByChange={handleSortByChange}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 flex-wrap min-h-[28px]">
        {activeFilters.length > 0 && (
          <>
            {activeFilters.map(filter => (
              <Badge key={`${filter.type}-${filter.id}`} variant="secondary" className="cursor-pointer" onClick={() => handleFilterToggle(filter.type, filter.id)}>
                {filter.name} <X className="ml-1.5 h-3 w-3" />
              </Badge>
            ))}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <aside className="hidden lg:block lg:col-span-1">
          <CatalogFilters 
            genres={genres} 
            selectedGenres={selectedGenres} 
            onGenreToggle={handleGenreToggle} 
            onReset={handleResetFilters}
            mediaType={mediaType}
            onMediaTypeChange={handleMediaTypeChange}
            studios={popularStudios}
            selectedStudios={selectedStudios}
            onStudioToggle={handleStudioToggle}
            networks={popularNetworks}
            selectedNetworks={selectedNetworks}
            onNetworkToggle={handleNetworkToggle}
            sortBy={sortBy}
            onSortByChange={handleSortByChange}
          />
        </aside>

        <main className="lg:col-span-3">
          {isSearching ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{t('search_results')}</h2>
                <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}><X className="h-4 w-4" /> Reset</Button>
              </div>
              {searchLoading && searchResults.length === 0 ? <LoadingSkeleton /> : searchResults.length > 0 ? <MediaGrid items={searchResults} onRequest={openRequestModal} showRequestButton={!!session} searchTerm={debouncedSearchTerm} /> : <Card><CardContent><p className="text-center text-muted-foreground py-8">{t('no_results_found')}</p></CardContent></Card>}
            </>
          ) : (
            <>
              {discoverLoading && discoverMedia.length === 0 ? <LoadingSkeleton /> : <MediaGrid items={discoverMedia} onRequest={openRequestModal} showRequestButton={!!session} />}
              
              {!discoverLoading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('previous')}
                  </Button>
                  <span className="text-sm text-muted-foreground font-mono">
                    {t('page')} {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    {t('next')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <RequestModal open={requestModalOpen} onOpenChange={setRequestModalOpen} item={selectedItemForRequest} onSuccess={() => {}} />
    </div>
  );
};

export default CatalogPage;