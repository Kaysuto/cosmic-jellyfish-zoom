import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Film, 
  Tv, 
  Users, 
  Database, 
  RefreshCw,
  Play,
  FolderOpen,
  Sparkles,
  TrendingUp,
  BarChart,
  Library,
  UserCheck
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface JellyfinStatsProps {
  storedStats?: any;
}

const JellyfinStats = ({ storedStats }: JellyfinStatsProps) => {
  const { t } = useSafeTranslation();
  const { libraries, users, connectionStatus, syncLibrary } = useJellyfin();
  const [syncing, setSyncing] = useState(false);

  // Fusion des sources: préférer les données persistées si disponibles
  // serverInfo non utilisé directement ici mais conservé pour cohérence du contexte

  const [persistedFallback, setPersistedFallback] = useState<any[] | null>(null);
  const [isLoadingPersisted, setIsLoadingPersisted] = useState(false);

  // Fonction pour déterminer automatiquement la catégorie basée sur le nom
  const determineCategory = (name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('anim') || lowerName.includes('animation')) return 'animations';
    if (lowerName.includes('série') || lowerName.includes('series') || lowerName.includes('tv')) return 'series';
    if (lowerName.includes('film') || lowerName.includes('movie')) return 'films';
    if (lowerName.includes('kai') || lowerName.includes('kaï')) return 'kai';
    if (lowerName.includes('animé') || lowerName.includes('anime')) return 'animes';
    
    // Déterminer par le contenu si le nom ne donne pas d'indice
    return 'unknown';
  };

  const effectiveLibraries = useMemo(() => {
    // Priorité 1: Données stockées dans le contexte (storedStats)
    const persisted = Array.isArray(storedStats?.libraries) ? storedStats?.libraries : [];
    
    // Priorité 2: Données de fallback chargées depuis Supabase
    const fallback = Array.isArray(persistedFallback) ? persistedFallback : [];
    
    // Priorité 3: Données live du contexte Jellyfin
    const live = Array.isArray(libraries) ? libraries : [];
    
    // Choisir la source avec le plus de données
    const sources = [
      { data: persisted, name: 'storedStats' },
      { data: fallback, name: 'persistedFallback' },
      { data: live, name: 'libraries' }
    ];
    
    const chosen = sources.reduce((best, current) => 
      current.data.length > best.data.length ? current : best
    );
    
    console.log(`Utilisation des données de: ${chosen.name} (${chosen.data.length} bibliothèques)`);
    
    if (chosen.data.length > 0) {
      return chosen.data.map((lib: any) => {
        if (lib?.stats) {
          // Ajouter la catégorie si elle n'existe pas
          if (!lib.category) {
            lib.category = determineCategory(lib.name);
          }
          return lib;
        }
        return {
          id: lib.id ?? lib.ItemId ?? String(lib.id),
          name: lib.name,
          collectionType: lib.collection_type ?? lib.collectionType,
          category: lib.category || determineCategory(lib.name),
          path: lib.path,
          stats: {
            movieCount: lib.movie_count ?? lib.stats?.movieCount ?? 0,
            seriesCount: lib.series_count ?? lib.stats?.seriesCount ?? 0,
            episodeCount: lib.episode_count ?? lib.stats?.episodeCount ?? 0,
            totalCount: lib.total_count ?? lib.stats?.totalCount ?? ((lib.movie_count ?? 0) + (lib.series_count ?? 0) + (lib.episode_count ?? 0)),
          }
        }
      });
    }
    
    return [];
  }, [storedStats?.libraries, libraries, persistedFallback]);

  // Charger depuis Supabase au montage du composant et quand les données sont vides
  React.useEffect(() => {
    const loadPersistedData = async () => {
      console.log('Vérification des données persistées...');
      console.log('storedStats?.libraries:', storedStats?.libraries?.length || 0);
      console.log('libraries:', libraries?.length || 0);
      console.log('persistedFallback:', persistedFallback?.length || 0);
      
      // Charger les données persistées si aucune donnée n'est disponible
      if ((!storedStats?.libraries || storedStats.libraries.length === 0) && 
          (!libraries || libraries.length === 0) && 
          (!persistedFallback || persistedFallback.length === 0)) {
        
        setIsLoadingPersisted(true);
        console.log('Chargement des données persistées depuis Supabase...');
        
        try {
          const { data, error } = await supabase.from('jellyfin_libraries_state').select('*');
          
          if (error) {
            console.error('Erreur lors du chargement des données persistées:', error);
            return;
          }
          
          if (Array.isArray(data) && data.length > 0) {
            console.log('Données persistées chargées:', data.length, 'bibliothèques');
            setPersistedFallback(data);
          } else {
            console.log('Aucune donnée persistée trouvée');
          }
        } finally {
          setIsLoadingPersisted(false);
        }
      }
    };
    
    loadPersistedData();
  }, []); // Se déclenche seulement au montage du composant

  // Charger aussi quand les données changent
  React.useEffect(() => {
    const loadPersistedIfEmpty = async () => {
      if ((!storedStats?.libraries || storedStats.libraries.length === 0) && 
          (!libraries || libraries.length === 0) && 
          (!persistedFallback || persistedFallback.length === 0)) {
        
        console.log('Rechargement des données persistées...');
        const { data, error } = await supabase.from('jellyfin_libraries_state').select('*');
        
        if (error) {
          console.error('Erreur lors du rechargement des données persistées:', error);
          return;
        }
        
        if (Array.isArray(data) && data.length > 0) {
          console.log('Données persistées rechargées:', data.length, 'bibliothèques');
          setPersistedFallback(data);
        }
      }
    };
    
    loadPersistedIfEmpty();
  }, [storedStats?.libraries, libraries]);

  const effectiveGlobalStats = useMemo(() => {
    const totalsFromLibraries = (libs: any[]) => libs.reduce((acc, library) => {
      acc.totalMovies += library.stats.movieCount || 0;
      acc.totalSeries += library.stats.seriesCount || 0;
      acc.totalEpisodes += library.stats.episodeCount || 0;
      acc.totalItems += library.stats.totalCount || 0;
      acc.libraryCount += library.stats.totalCount > 0 ? 1 : 0;
      return acc;
    }, { totalMovies: 0, totalSeries: 0, totalEpisodes: 0, totalItems: 0, libraryCount: 0 });

    // FORCER l'utilisation des calculs à partir des bibliothèques individuelles pour garantir la cohérence
    return totalsFromLibraries(effectiveLibraries);
  }, [effectiveLibraries]);

  const handleSyncLibrary = async () => {
    if (connectionStatus !== 'connected') {
      showError(t('jellyfin_not_connected'));
      return;
    }

    setSyncing(true);
    try {
      await syncLibrary();
      const [{ data: _stats }, { data: libsState }] = await Promise.all([
        supabase.from('jellyfin_statistics_state').select('*').eq('id', 1).single(),
        supabase.from('jellyfin_libraries_state').select('*')
      ]);
      if (Array.isArray(libsState)) setPersistedFallback(libsState);
      showSuccess(t('sync_success'));
    } catch (error: any) {
      showError(t('sync_error') + ': ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  // Configuration des catégories avec icônes et couleurs améliorées
  const categoryConfig = {
    animations: { 
      icon: Play, 
      color: 'text-blue-400', 
      bgColor: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
      accent: 'text-blue-300'
    },
    series: { 
      icon: Tv, 
      color: 'text-emerald-400', 
      bgColor: 'bg-gradient-to-br from-emerald-500/20 to-green-500/10',
      borderColor: 'border-emerald-500/30',
      gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
      accent: 'text-emerald-300'
    },
    films: { 
      icon: Film, 
      color: 'text-purple-400', 
      bgColor: 'bg-gradient-to-br from-purple-500/20 to-violet-500/10',
      borderColor: 'border-purple-500/30',
      gradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
      accent: 'text-purple-300'
    },
    kai: { 
      icon: FolderOpen, 
      color: 'text-orange-400', 
      bgColor: 'bg-gradient-to-br from-orange-500/20 to-amber-500/10',
      borderColor: 'border-orange-500/30',
      gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
      accent: 'text-orange-300'
    },
    animes: { 
      icon: Sparkles, 
      color: 'text-pink-400', 
      bgColor: 'bg-gradient-to-br from-pink-500/20 to-rose-500/10',
      borderColor: 'border-pink-500/30',
      gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
      accent: 'text-pink-300'
    }
  };

  // Configuration par défaut pour les catégories inconnues
  const defaultConfig = {
    icon: Database,
    color: 'text-slate-400',
    bgColor: 'bg-gradient-to-br from-slate-500/20 to-gray-500/10',
    borderColor: 'border-slate-500/30',
    gradient: 'from-slate-500/20 via-gray-500/10 to-transparent',
    accent: 'text-slate-300'
  };

  // Fonction pour obtenir la configuration d'une catégorie
  const getCategoryConfig = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig] || defaultConfig;
  };

  // Fonction pour traduire les clés de catégorie
  const getCategoryDisplayName = (category: string) => {
    const translations = {
      animations: t('animations_label'),
      series: t('series_label'),
      films: t('films_label'),
      kai: t('kai'),
      animes: t('animes'),
      unknown: 'Autre'
    };
    return translations[category as keyof typeof translations] || category;
  };

  // globalStats calculés via effectiveGlobalStats

  // Fonction pour afficher les statistiques pertinentes selon la catégorie
  const renderRelevantStats = (library: any) => {
    const { category, stats } = library;
    
    // Log temporaire pour déboguer
    console.log(`Library: ${library.name}, Category: ${category}, Stats:`, stats);
    const metricsCount = [stats.movieCount, stats.seriesCount, stats.episodeCount].filter((n) => (n ?? 0) > 0).length;
    
    switch (category) {
      case 'animations':
      case 'films':
        return (
          <div className="space-y-4">
            {stats.movieCount > 0 && (
              <div className="group/stat relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-background/40 to-background/20 border border-border/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-border/50">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Film className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t('movies')}</span>
                  </div>
                  <span className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    {stats.movieCount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            {metricsCount > 1 && (
              <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 border-2 border-primary/40 backdrop-blur-sm shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-60" />
                <div className="relative flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    {t('total')}
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {stats.totalCount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'series':
      case 'kai':
      case 'animes':
        return (
          <div className="space-y-4">
            {stats.seriesCount > 0 && (
              <div className="group/stat relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-background/40 to-background/20 border border-border/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-border/50">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Tv className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t('tv_shows')}</span>
                  </div>
                  <span className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    {stats.seriesCount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            {stats.episodeCount > 0 && (
              <div className="group/stat relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-background/40 to-background/20 border border-border/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-border/50">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Play className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t('episodes')}</span>
                  </div>
                  <span className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    {stats.episodeCount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            {metricsCount > 1 && (
              <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 border-2 border-primary/40 backdrop-blur-sm shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-60" />
                <div className="relative flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    {t('total')}
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {stats.totalCount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        console.log(`Unknown category: ${category}, using default display`);
        return (
          <div className="space-y-4">
            {stats.movieCount > 0 && (
              <div className="group/stat relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-background/40 to-background/20 border border-border/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-border/50">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Film className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t('movies')}</span>
                  </div>
                  <span className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    {stats.movieCount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            {stats.seriesCount > 0 && (
              <div className="group/stat relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-background/40 to-background/20 border border-border/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-border/50">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Tv className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t('tv_shows')}</span>
                  </div>
                  <span className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    {stats.seriesCount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            {stats.episodeCount > 0 && (
              <div className="group/stat relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-background/40 to-background/20 border border-border/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-border/50">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Play className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t('episodes')}</span>
                  </div>
                  <span className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    {stats.episodeCount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 border-2 border-primary/40 backdrop-blur-sm shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-60" />
              <div className="relative flex items-center justify-between">
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {t('total')}
                </span>
                <span className="text-xl font-bold text-primary">
                  {stats.totalCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Section 1: En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
            {t('jellyfin_dashboard')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('jellyfin_dashboard_desc')}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="lg"
          onClick={handleSyncLibrary} 
          disabled={syncing || connectionStatus !== 'connected'}
          className="group/btn relative overflow-hidden bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 hover:from-primary/20 hover:to-secondary/20 transition-all duration-300 hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-3">
            {syncing ? (
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <RefreshCw className="h-5 w-5 text-primary" />
            )}
            <span className="font-semibold">
              {syncing ? t('sync_in_progress') : t('sync_library')}
            </span>
          </div>
        </Button>
      </div>

      {/* Section 2: Résumé global */}
      <Card className="group relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-background via-background/95 to-muted/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <CardHeader className="relative">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/30">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                {t('global_overview')}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-1">
                {t('global_overview_desc')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="group/stat relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
              <div className="relative text-center">
                <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 inline-block mb-3">
                  <Film className="h-6 w-6 text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">{t('total_movies')}</p>
                <p className="text-2xl font-bold text-blue-400">{effectiveGlobalStats.totalMovies.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="group/stat relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-emerald-500/20 to-green-500/10 border border-emerald-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-emerald-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
              <div className="relative text-center">
                <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 inline-block mb-3">
                  <Tv className="h-6 w-6 text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">{t('total_series')}</p>
                <p className="text-2xl font-bold text-emerald-400">{effectiveGlobalStats.totalSeries.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="group/stat relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-purple-500/20 to-violet-500/10 border border-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-purple-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
              <div className="relative text-center">
                <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/30 inline-block mb-3">
                  <Play className="h-6 w-6 text-purple-400" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">{t('total_episodes')}</p>
                <p className="text-2xl font-bold text-purple-400">{effectiveGlobalStats.totalEpisodes.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="group/stat relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-primary/20 to-secondary/10 border border-primary/30 backdrop-blur-sm transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
              <div className="relative text-center">
                <div className="p-3 rounded-lg bg-primary/20 border border-primary/30 inline-block mb-3">
                  <Library className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">{t('active_libraries')}</p>
                <p className="text-2xl font-bold text-primary">{effectiveGlobalStats.libraryCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Bibliothèques individuelles */}
      <Card className="group relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-background via-background/95 to-muted/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <CardHeader className="relative">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/30">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                {t('library_individual_details')}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-1">
                {t('library_individual_details_desc')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {isLoadingPersisted ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-muted/30 border border-border/30 inline-block mb-4">
                <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">Chargement des données persistées...</p>
            </div>
          ) : effectiveLibraries && effectiveLibraries.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {effectiveLibraries
                  .filter((library: any) => library.stats.totalCount > 0)
                  .map((library: any, index: number) => {
                  const config = getCategoryConfig(library.category);
                  const IconComponent = config.icon;
                  
                  return (
                    <div 
                      key={library.id} 
                      className={`group/card relative overflow-hidden rounded-2xl border transition-all duration-500 hover:shadow-2xl hover:scale-[1.03] ${config.bgColor} ${config.borderColor} hover:${config.borderColor.replace('/30', '/50')} animate-in slide-in-from-bottom-4 fade-in-0 duration-500`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover/card:opacity-100 transition-opacity duration-500`} />
                      
                      <div className="absolute top-4 right-4 opacity-20 group-hover/card:opacity-40 transition-opacity duration-300">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      
                      <div className="relative p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${config.bgColor.replace('/20', '/30')} ${config.borderColor} border-2 transition-all duration-300 group-hover/card:scale-110`}>
                              <IconComponent className={`h-6 w-6 ${config.color}`} />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-foreground">
                                {getCategoryDisplayName(library.category)}
                              </h4>
                              <p className="text-sm text-muted-foreground font-medium">
                                {library.name}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-sm font-bold px-4 py-2 ${config.borderColor} ${config.accent} bg-background/60 backdrop-blur-sm border-2 transition-all duration-300 group-hover/card:scale-110`}
                          >
                            {library.stats.totalCount.toLocaleString()}
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          {renderRelevantStats(library)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {effectiveLibraries.filter((library: any) => library.stats.totalCount > 0).length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-muted/30 border border-border/30 inline-block mb-4">
                    <Database className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-lg font-medium">{t('no_libraries_with_content')}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-muted/30 border border-border/30 inline-block mb-4">
                <Database className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">{t('no_libraries_found')}</p>
              <p className="text-sm text-muted-foreground mt-2">{t('sync_to_load_libraries')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Utilisateurs récents */}
      <Card className="group relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-background via-background/95 to-muted/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <CardHeader className="relative">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/30">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                {t('recent_users')}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-1">
                {t('recent_users_desc')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {Array.isArray(users) && users.length > 0 ? (
            <div className="space-y-4">
              {users.slice(0, 5).map((user, index) => (
                <div 
                  key={user.Id} 
                  className="group/user relative overflow-hidden p-4 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border border-border/30 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-border/50 animate-in slide-in-from-left-4 fade-in-0"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover/user:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold border border-primary/30 transition-all group-hover/user:scale-110">
                        {user.Name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{user.Name}</p>
                        <p className="text-sm text-muted-foreground">ID: {user.Id}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs font-semibold border-primary/30 bg-primary/10 text-primary transition-all group-hover/user:scale-110"
                    >
                      {user.LastActivityDate ? t('active') : t('inactive')}
                    </Badge>
                  </div>
                </div>
              ))}
              {users.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground font-medium">
                    {t('and_more_users', { count: users.length - 5 })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-muted/30 border border-border/30 inline-block mb-4">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">{t('no_users_found')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JellyfinStats;
