import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MediaGrid, { MediaItem } from '@/components/catalog/MediaGrid';
import RequestModal from '@/components/catalog/RequestModal';
import { useSession } from '@/contexts/AuthContext';

type MediaType = 'movie' | 'tv' | 'anime';

const FullSectionPage = () => {
  const { mediaType } = useParams<{ mediaType: MediaType }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('popularity.desc');
  
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<MediaItem | null>(null);

  const sortOptions = {
    'popularity.desc': t('sort_popularity_desc'),
    'release_date.desc': t('sort_release_date_desc'),
    'vote_average.desc': t('sort_vote_average_desc'),
  };

  const fetchMedia = useCallback(async () => {
    if (!mediaType) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('discover-media', {
        body: {
          mediaType,
          language: i18n.language,
          page,
          sortBy,
        },
      });
      if (error) throw error;
      
      const tmdbItems = data.results;
      const tmdbIds = tmdbItems.map((item: MediaItem) => item.id);

      if (tmdbIds.length > 0) {
        const { data: catalogData, error: catalogError } = await supabase
          .from('catalog_items')
          .select('tmdb_id')
          .in('tmdb_id', tmdbIds);
        
        if (catalogError) {
          console.error("Error checking catalog availability", catalogError);
          setMedia(tmdbItems);
        } else {
          const availableIds = new Set(catalogData.map(item => item.tmdb_id));
          const itemsWithAvailability = tmdbItems.map((item: MediaItem) => ({
            ...item,
            isAvailable: availableIds.has(item.id),
          }));
          setMedia(itemsWithAvailability);
        }
      } else {
        setMedia(tmdbItems);
      }

      const totalApiPages = Math.min(data.total_pages ?? 1, 500);
      setTotalPages(totalApiPages);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }, [mediaType, i18n.language, page, sortBy]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMedia();
  }, [fetchMedia]);

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const openRequestModal = (item: MediaItem) => {
    setSelectedItemForRequest(item);
    setRequestModalOpen(true);
  };

  const pageTitle = useMemo(() => {
    switch (mediaType) {
      case 'movie': return t('popular_movies');
      case 'tv': return t('popular_tv_shows');
      case 'anime': return t('popular_animes');
      default: return t('catalog');
    }
  }, [mediaType, t]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[...Array(20)].map((_, i) => (
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
      <Button variant="outline" onClick={() => navigate('/catalog')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('back_to_catalog')}
      </Button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold tracking-tight">{pageTitle}</h1>
        <div className="w-full sm:w-auto">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[200px] justify-between">
                {sortOptions[sortBy as keyof typeof sortOptions]}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              {Object.entries(sortOptions).map(([value, label]) => (
                <DropdownMenuItem key={value} onSelect={() => handleSortByChange(value)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading ? <LoadingSkeleton /> : <MediaGrid items={media} onRequest={openRequestModal} showRequestButton={!!session} />}

      {!loading && totalPages > 1 && (
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

      <RequestModal open={requestModalOpen} onOpenChange={setRequestModalOpen} item={selectedItemForRequest} />
    </div>
  );
};

export default FullSectionPage;