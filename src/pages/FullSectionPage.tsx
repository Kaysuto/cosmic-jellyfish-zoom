import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MediaGrid, { MediaItem } from '@/components/catalog/MediaGrid';
import RequestModal from '@/components/catalog/RequestModal';
import { useSession } from '@/contexts/AuthContext';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type CatalogSection = 'animations' | 'animes' | 'films' | 'series';

const FullSectionPage = () => {
  const { section } = useParams();
  const { t, i18n } = useSafeTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useSession();
  const { error: jellyfinError } = useJellyfin();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<MediaItem | null>(null);

  const sortOptions = {
    'popularity.desc': t('sort_popularity_desc'),
    'vote_average.desc': t('sort_vote_average_desc'),
    'release_date.desc': t('sort_release_date_desc'),
  };

  const fetchMedia = useCallback(async () => {
    if (!section) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('discover-media', {
        body: { section, language: i18n.language, page, sortBy, availableOnly },
      });
      if (error) throw error;
      
      const tmdbItems = data.results;
      let items = tmdbItems;

      if (!availableOnly && tmdbItems.length > 0) {
        const tmdbIds = tmdbItems.map((item: MediaItem) => item.id);
        const { data: catalogData, error: catalogError } = await supabase
          .from('catalog_items')
          .select('tmdb_id')
          .in('tmdb_id', tmdbIds);
        
        if (!catalogError) {
          const availableIds = new Set(catalogData.map(item => item.tmdb_id));
          items = tmdbItems.map((item: MediaItem) => ({
            ...item,
            isAvailable: availableIds.has(item.id),
          }));
        }
      } else if (availableOnly) {
        items = tmdbItems.map((item: MediaItem) => ({
          ...item,
          isAvailable: true,
        }));
      }

      setMedia(items);
      setTotalPages(Math.min(data.total_pages ?? 1, 500));
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }, [section, i18n.language, page, sortBy, availableOnly]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMedia();
  }, [fetchMedia]);

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handleAvailableOnlyChange = (checked: boolean) => {
    setAvailableOnly(checked);
    setPage(1); // Toujours revenir à la page 1 lors du changement de filtre
  };

  const openRequestModal = (item: MediaItem) => {
    setSelectedItemForRequest(item);
    setRequestModalOpen(true);
  };

  const pageTitle = useMemo(() => {
    switch (section) {
      case 'animations': return t('catalog_section_animations');
      case 'animes': return t('catalog_section_animes');
      case 'films': return t('catalog_section_films');
      case 'series': return t('catalog_section_series');
      default: return t('catalog');
    }
  }, [section, t]);

  const pageDescription = useMemo(() => {
    switch (section) {
      case 'animations': return t('catalog_section_animations_desc');
      case 'animes': return t('catalog_section_animes_desc');
      case 'films': return t('catalog_section_films_desc');
      case 'series': return t('catalog_section_series_desc');
      default: return '';
    }
  }, [section, t]);

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

  if (!section) {
    return <div className="container mx-auto px-4 py-8 text-center">{t('invalid_section')}</div>;
  }

  if (jellyfinError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="outline" className="mb-6">
          <Link to="/catalog">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('back_to_catalog')}
          </Link>
        </Button>
        <div className="text-red-500 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p>Erreur de configuration Jellyfin : {jellyfinError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button asChild variant="outline" className="mb-4">
            <Link to="/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t('back_to_catalog')}
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
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
        <div className="flex items-center space-x-2">
          <Switch
            id="available-only"
            checked={availableOnly}
            onCheckedChange={handleAvailableOnlyChange}
          />
          <Label htmlFor="available-only">{t('available_in_catalog')}</Label>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {media.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {availableOnly 
                  ? t('no_available_content_found') 
                  : t('no_content_found')
                }
              </p>
              {availableOnly && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t('try_disabling_available_filter')}
                </p>
              )}
            </div>
          ) : (
            <>
              <MediaGrid items={media} showRequestButton={!!session} onRequest={openRequestModal} />
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t('previous')}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t('page')} {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    {t('next')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <RequestModal 
        open={requestModalOpen} 
        onOpenChange={setRequestModalOpen} 
        item={selectedItemForRequest} 
      />
    </div>
  );
};

export default FullSectionPage;