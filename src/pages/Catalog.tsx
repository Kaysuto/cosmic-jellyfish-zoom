import React, { useState, useEffect, useCallback } from 'react';
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
import RequestModal from '@/components/catalog/RequestModal';
import { useSession } from '@/contexts/AuthContext';
import MediaSection from '@/components/catalog/MediaSection';
import ContinueWatching from '@/components/catalog/ContinueWatching';

const CatalogPage = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 450);
  
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<MediaItem | null>(null);

  const fetchSearchResults = useCallback(async () => {
    if (!debouncedSearchTerm) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-media', {
        body: { query: debouncedSearchTerm, language: i18n.language },
      });
      if (error) throw error;
      setSearchResults(data);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, i18n.language]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setSearchParams({ q: debouncedSearchTerm });
      fetchSearchResults();
    } else {
      searchParams.delete('q');
      setSearchParams(searchParams);
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, fetchSearchResults, setSearchParams, searchParams]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[...Array(18)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

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

      <div className="relative w-full mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('search_and_request')}
          className="pl-10"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        {searchTerm && !loading && (
          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <main>
        {debouncedSearchTerm ? (
          loading ? <LoadingSkeleton /> : (
            searchResults.length > 0 ? (
              <MediaGrid items={searchResults} onRequest={openRequestModal} showRequestButton={!!session} searchTerm={debouncedSearchTerm} />
            ) : (
              <Card><CardContent><p className="text-center text-muted-foreground py-8">{t('no_results_found')}</p></CardContent></Card>
            )
          )
        ) : (
          <div className="space-y-12">
            <ContinueWatching />
            <MediaSection title={t('popular_movies')} mediaType="movie" />
            <MediaSection title={t('popular_tv_shows')} mediaType="tv" />
            <MediaSection title={t('popular_animes')} mediaType="anime" />
          </div>
        )}
      </main>

      <RequestModal open={requestModalOpen} onOpenChange={setRequestModalOpen} item={selectedItemForRequest} onSuccess={() => {}} />
    </div>
  );
};

export default CatalogPage;