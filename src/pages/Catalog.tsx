import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import MediaGrid, { MediaItem } from '../components/catalog/MediaGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent } from '@/components/ui/card';
import RequestModal from '@/components/catalog/RequestModal';
import { useSession } from '@/contexts/AuthContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import MediaCard from '@/components/catalog/MediaCard';

const CatalogPage = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 450);
  
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [tvShows, setTvShows] = useState<MediaItem[]>([]);
  const [animes, setAnimes] = useState<MediaItem[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

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

  const fetchSections = useCallback(async () => {
    setSectionsLoading(true);
    try {
      const [movieRes, tvRes, animeRes] = await Promise.all([
        supabase.functions.invoke('discover-media', {
          body: { mediaType: 'movie', language: i18n.language, page: 1, sortBy: 'popularity.desc' },
        }),
        supabase.functions.invoke('discover-media', {
          body: { mediaType: 'tv', language: i18n.language, page: 1, sortBy: 'popularity.desc' },
        }),
        supabase.functions.invoke('discover-media', {
          body: { mediaType: 'anime', language: i18n.language, page: 1, sortBy: 'popularity.desc' },
        }),
      ]);

      if (movieRes.error) throw movieRes.error;
      setMovies(movieRes.data.results);

      if (tvRes.error) throw tvRes.error;
      setTvShows(tvRes.data.results);

      if (animeRes.error) throw animeRes.error;
      setAnimes(animeRes.data.results);

    } catch (error: any) {
      showError(error.message);
    } finally {
      setSectionsLoading(false);
    }
  }, [i18n.language]);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      fetchSections();
    }
  }, [debouncedSearchTerm, fetchSections]);

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

  const LoadingSkeleton = () => (
    <div className="flex space-x-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="w-[16.66%] flex-shrink-0">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        </div>
      ))}
    </div>
  );

  const isSearching = debouncedSearchTerm.length > 0;

  const openRequestModal = (item: MediaItem) => {
    setSelectedItemForRequest(item);
    setRequestModalOpen(true);
  };

  const renderSection = (titleKey: string, items: MediaItem[], linkTo: string) => (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold">{t(titleKey)}</h2>
        <Button asChild variant="ghost">
          <Link to={linkTo}>{t('view_all')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
      {sectionsLoading ? <LoadingSkeleton /> : (
        <Carousel opts={{ align: "start", dragFree: true }}>
          <CarouselContent className="-ml-4">
            {items.map((item) => (
              <CarouselItem key={item.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                <MediaCard item={item} onRequest={openRequestModal} showRequestButton={!!session} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      )}
    </section>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{t('catalog')}</h1>
        <p className="text-muted-foreground">{t('catalog_description')}</p>
      </div>

      <div className="relative w-full mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('search_for_media')}
          className="pl-10"
        />
        {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
      </div>

      <main>
        {isSearching ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{t('search_results')}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}><X className="h-4 w-4" /> Reset</Button>
            </div>
            {searchLoading && searchResults.length === 0 ? <LoadingSkeleton /> : searchResults.length > 0 ? <MediaGrid items={searchResults} onRequest={openRequestModal} showRequestButton={!!session} searchTerm={debouncedSearchTerm} /> : <Card><CardContent><p className="text-center text-muted-foreground py-8">{t('no_results_found')}</p></CardContent></Card>}
          </>
        ) : (
          <div className="space-y-12">
            {renderSection('movies', movies, '/catalog/movie')}
            {renderSection('tv_shows', tvShows, '/catalog/tv')}
            {renderSection('animes', animes, '/catalog/anime')}
          </div>
        )}
      </main>

      <RequestModal open={requestModalOpen} onOpenChange={setRequestModalOpen} item={selectedItemForRequest} onSuccess={() => {}} />
    </div>
  );
};

export default CatalogPage;