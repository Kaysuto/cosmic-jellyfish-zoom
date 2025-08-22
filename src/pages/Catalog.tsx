import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import MediaGrid, { MediaItem } from '../components/catalog/MediaGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Film, Tv, Flame, X, Filter, Star, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { useDebounce } from '@/hooks/useDebounce';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import RequestModal from '@/components/catalog/RequestModal';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

const CatalogPage = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 450);
  
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [discoverMedia, setDiscoverMedia] = useState<MediaItem[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [mediaType, setMediaType] = useState<'movie' | 'tv' | 'anime'>('movie');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [heroMedia, setHeroMedia] = useState<MediaItem | null>(null);

  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('popularity.desc');

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<MediaItem | null>(null);

  const loaderRef = useRef(null);

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

  const fetchDiscoverMedia = useCallback(async (currentPage: number) => {
    if (debouncedSearchTerm) return;
    setDiscoverLoading(true);
    try {
      // BUG FIX: Ensure mediaType is always passed
      if (!mediaType) {
        console.error("mediaType is not defined, aborting fetch.");
        setDiscoverLoading(false);
        return;
      }
      const { data, error } = await supabase.functions.invoke('discover-media', {
        body: {
          mediaType,
          language: i18n.language,
          page: currentPage,
          sortBy,
          genres: selectedGenres.join(','),
        },
      });
      if (error) throw error;
      
      setDiscoverMedia(prev => currentPage === 1 ? data.results : [...prev, ...data.results]);
      if (currentPage === 1 && data.results.length > 0) {
        setHeroMedia(data.results[0]);
      }
      setHasMore(currentPage < data.total_pages && data.results.length > 0);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setDiscoverLoading(false);
    }
  }, [debouncedSearchTerm, mediaType, i18n.language, sortBy, selectedGenres]);

  useEffect(() => {
    setDiscoverMedia([]);
    setPage(1);
    setHasMore(true);
    fetchDiscoverMedia(1);
  }, [mediaType, sortBy, selectedGenres, i18n.language]);

  useEffect(() => {
    if (page > 1) {
      fetchDiscoverMedia(page);
    }
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !discoverLoading && !debouncedSearchTerm) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, discoverLoading, debouncedSearchTerm]);

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
    fetchGenres();
  }, [fetchGenres]);

  const handleMediaTypeChange = (value: 'movie' | 'tv' | 'anime') => {
    setMediaType(value);
    setSelectedGenres([]);
    setSortBy('popularity.desc');
  };

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const openRequestModal = (item: MediaItem) => {
    setSelectedItemForRequest(item);
    setRequestModalOpen(true);
  };

  const HeroSection = () => {
    if (discoverLoading && page === 1) return <Skeleton className="h-[40vh] w-full rounded-lg mb-8" />;
    if (!heroMedia) return null;

    const title = heroMedia.title || heroMedia.name;
    const releaseDate = heroMedia.release_date || heroMedia.first_air_date;

    return (
      <div className="relative h-[40vh] rounded-lg overflow-hidden mb-8 text-white">
        <img
          src={`https://image.tmdb.org/t/p/original${heroMedia.poster_path}`}
          alt={title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h2 className="text-4xl font-bold">{title}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm">
            {releaseDate && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(releaseDate).getFullYear()}</span>}
            {heroMedia.vote_average && <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400" /> {heroMedia.vote_average.toFixed(1)} / 10</span>}
          </div>
          <div className="mt-4 flex gap-2">
            <Button asChild size="lg">
              <Link to={`/media/${heroMedia.media_type}/${heroMedia.id}`}>
                {t('view_details')}
              </Link>
            </Button>
            <Button variant="secondary" size="lg" onClick={() => openRequestModal(heroMedia)}>
              {t('request')}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const FilterBar = () => (
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
        <Button variant={mediaType === 'movie' ? 'secondary' : 'ghost'} onClick={() => handleMediaTypeChange('movie')}><Film className="mr-2 h-4 w-4" />{t('movie')}</Button>
        <Button variant={mediaType === 'tv' ? 'secondary' : 'ghost'} onClick={() => handleMediaTypeChange('tv')}><Tv className="mr-2 h-4 w-4" />{t('tv_show')}</Button>
        <Button variant={mediaType === 'anime' ? 'secondary' : 'ghost'} onClick={() => handleMediaTypeChange('anime')}><Flame className="mr-2 h-4 w-4" />{t('anime')}</Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {t('filter')}
              {selectedGenres.length > 0 && <Badge variant="secondary" className="ml-2">{selectedGenres.length}</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{t('sort_by')}</h4>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity.desc">{t('sort_popularity_desc')}</SelectItem>
                    <SelectItem value="release_date.desc">{t('sort_release_date_desc')}</SelectItem>
                    <SelectItem value="vote_average.desc">{t('sort_rating_desc')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('genres')}</h4>
                <ScrollArea className="h-48">
                  <div className="flex flex-wrap gap-2">
                    {genres.map(genre => (
                      <Badge
                        key={genre.id}
                        variant={selectedGenres.includes(genre.id) ? 'default' : 'secondary'}
                        onClick={() => handleGenreToggle(genre.id)}
                        className="cursor-pointer"
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  const isSearching = debouncedSearchTerm.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{t('catalog')}</h1>
        <p className="text-muted-foreground">{t('catalog_description')}</p>
      </div>

      {!isSearching && <HeroSection />}
      <FilterBar />

      {selectedGenres.length > 0 && !isSearching && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          {selectedGenres.map(id => {
            const g = genres.find(x => x.id === id);
            return g ? <Badge key={id}>{g.name}</Badge> : null;
          })}
          <Button variant="ghost" size="sm" onClick={() => setSelectedGenres([])}><X className="mr-1 h-4 w-4" />Effacer</Button>
        </div>
      )}

      {isSearching ? (
        <>
          <h2 className="text-2xl font-semibold mb-4">{t('search_results')}</h2>
          {searchLoading ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> : <MediaGrid items={searchResults} onRequest={openRequestModal} />}
        </>
      ) : (
        <>
          <MediaGrid items={discoverMedia} onRequest={openRequestModal} />
          <div ref={loaderRef} className="h-10 flex items-center justify-center">
            {discoverLoading && page > 1 && <Loader2 className="h-8 w-8 animate-spin" />}
          </div>
        </>
      )}

      <RequestModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        item={selectedItemForRequest}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default CatalogPage;