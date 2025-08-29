import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search as SearchIcon, Loader2, Film, Tv, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import MediaGrid from '@/components/catalog/MediaGrid';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  vote_average?: number;
  overview?: string;
}

// Cache simple pour les résultats de recherche
const searchCache = new Map<string, SearchResult[]>();

const Search = () => {
  const { t } = useSafeTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Debounce le terme de recherche pour éviter les appels API trop fréquents
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Vérifier le cache d'abord
    const cacheKey = query.trim().toLowerCase();
    if (searchCache.has(cacheKey)) {
      setResults(searchCache.get(cacheKey)!);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: searchError } = await supabase.functions.invoke('search-media', {
        body: {
          query: query.trim(),
          language: 'fr-FR'
        }
      });

      if (searchError) {
        throw new Error(searchError.message);
      }

      if (data && data.results) {
        // Transformer les résultats pour correspondre au format MediaGrid
        const transformedResults = data.results.map((item: any) => ({
          id: item.id,
          title: item.title || item.name,
          name: item.name,
          poster_path: item.poster_path,
          release_date: item.release_date,
          first_air_date: item.first_air_date,
          media_type: item.media_type,
          vote_average: item.vote_average,
          overview: item.overview
        }));
        
        // Mettre en cache les résultats
        searchCache.set(cacheKey, transformedResults);
        setResults(transformedResults);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gérer les changements de searchTerm et mettre à jour l'URL
  useEffect(() => {
    if (debouncedSearchTerm !== searchParams.get('q')) {
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        setSearchParams({ q: debouncedSearchTerm.trim() });
      } else {
        setSearchParams({});
      }
    }
  }, [debouncedSearchTerm, setSearchParams, searchParams]);

  // Effectuer la recherche quand le terme debounced change
  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
      performSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm === '') {
      setResults([]);
    }
  }, [debouncedSearchTerm, performSearch]);

  // Rediriger vers /catalog si la recherche est vide et qu'on n'est pas en train de taper
  useEffect(() => {
    if (debouncedSearchTerm === '' && searchTerm === '') {
      navigate('/catalog');
    }
  }, [debouncedSearchTerm, searchTerm, navigate]);

  // Recherche initiale depuis les paramètres d'URL (seulement au montage)
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query !== searchTerm) {
      setSearchTerm(query);
      if (query.trim()) {
        performSearch(query);
      }
    }
  }, []); // Dépendances vides pour ne s'exécuter qu'au montage

  // Optimisation : mémoriser les résultats transformés
  const transformedResults = useMemo(() => {
    return results.map(item => ({
      ...item,
      title: item.title || item.name,
      name: item.name
    }));
  }, [results]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="text-center">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back_to_catalog')}
            </Link>
          </Button>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{t('search_results')}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t('search_description')}
        </p>
      </header>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('search_movies_and_shows')}</CardTitle>
          <CardDescription>{t('search_help_text')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-lg mx-auto items-center space-x-2">
            <Input
              type="search"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              autoFocus
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">{t('searching')}</span>
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <SearchIcon className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && searchTerm && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {t('search_results_for')}: "{searchTerm}"
            </h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Film className="h-4 w-4" />
              <span>{results.length} {t('results_found')}</span>
            </div>
          </div>

          {results.length > 0 ? (
            <MediaGrid items={transformedResults} showRequestButton={true} searchTerm={searchTerm} />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('no_results_found')}</h3>
                <p className="text-muted-foreground">{t('try_different_keywords')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!loading && !error && !searchTerm && (
        <Card>
          <CardContent className="pt-6 text-center">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('start_searching')}</h3>
            <p className="text-muted-foreground">{t('enter_search_term_above')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Search;
