import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useJellyfinSettings } from '@/hooks/useJellyfinSettings';
import { supabase } from '@/integrations/supabase/client';

// Types for Jellyfin data
interface JellyfinServerInfo {
  ServerName: string;
  Version: string;
}

interface JellyfinLibraryInfo {
  movieCount: number;
  seriesCount: number;
}

interface JellyfinLibraryStats {
  id: string;
  name: string;
  collectionType: string;
  category: string;
  path: string;
  stats: {
    movieCount: number;
    seriesCount: number;
    episodeCount: number;
    totalCount: number;
  };
}

interface CategorizedStats {
  movies: number;
  series: number;
  episodes: number;
  total: number;
}

interface JellyfinCategorizedStats {
  animations: CategorizedStats;
  series: CategorizedStats;
  films: CategorizedStats;
  kai: CategorizedStats;
  animes: CategorizedStats;
}

interface JellyfinUser {
  Id: string;
  Name: string;
  LastActivityDate?: string;
}

export interface JellyfinContextType {
  serverInfo: JellyfinServerInfo | null;
  libraryInfo: JellyfinLibraryInfo | null;
  libraries: JellyfinLibraryStats[] | null;
  categorizedStats: JellyfinCategorizedStats | null;
  users: JellyfinUser[] | null;
  loading: boolean;
  error: string | null;
  syncUserToJellyfin: (userId: string) => Promise<void>;
  syncApprovedRequests: () => Promise<void>;
  syncLibrary: () => Promise<void>;
  connectionStatus: 'connected' | 'disconnected' | 'loading';
  jellyfinUrl: string;
}

const JellyfinContext = createContext<JellyfinContextType | undefined>(undefined);

export const JellyfinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, loading: settingsLoading } = useJellyfinSettings();
  const [serverInfo, setServerInfo] = useState<JellyfinServerInfo | null>(null);
  const [libraryInfo, setLibraryInfo] = useState<JellyfinLibraryInfo | null>(null);
  const [libraries, setLibraries] = useState<JellyfinLibraryStats[] | null>(null);
  const [categorizedStats, setCategorizedStats] = useState<JellyfinCategorizedStats | null>(null);
  const [users, setUsers] = useState<JellyfinUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');

  const fetchData = useCallback(async () => {
    if (!settings.url || !settings.api_key) {
      setError("Jellyfin URL or API key not configured.");
      setConnectionStatus('disconnected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setConnectionStatus('loading');

    try {
      const { data, error: functionError } = await supabase.functions.invoke('jellyfin-proxy', {
        body: { endpoint: 'System/Info' },
      });

      if (functionError) throw new Error(functionError.message);
      if (data.error) throw new Error(data.error);
      
      setServerInfo(data);
      setConnectionStatus('connected');

      // Fetch other data in parallel
      const [libraryData, usersData] = await Promise.all([
        supabase.functions.invoke('jellyfin-proxy', { body: { endpoint: 'Items/Counts' } }),
        supabase.functions.invoke('jellyfin-proxy', { body: { endpoint: 'Users' } })
      ]);

      if (libraryData.data && !libraryData.data.error) {
        setLibraryInfo({
          movieCount: libraryData.data.MovieCount,
          seriesCount: libraryData.data.SeriesCount,
        });
      }

      if (usersData.data && !usersData.data.error) {
        setUsers(usersData.data);
      }

    } catch (e: any) {
      setError(`Failed to connect to Jellyfin: ${e.message}`);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, [settings.url, settings.api_key]);

  useEffect(() => {
    if (!settingsLoading) {
      fetchData();
    }
  }, [settingsLoading, fetchData]);

  const syncUserToJellyfin = async (userId: string) => {
    // Implementation for syncing user
    console.log("Syncing user to Jellyfin:", userId);
  };

  const syncApprovedRequests = async () => {
    try {
      // Récupérer les demandes approuvées qui ne sont pas encore synchronisées
      const { data: approvedRequests, error } = await supabase
        .from('media_requests')
        .select('*')
        .eq('status', 'approved')
        .is('synced_to_jellyfin', false);

      if (error) throw error;

      if (!approvedRequests || approvedRequests.length === 0) {
        console.log("Aucune demande approuvée à synchroniser");
        return;
      }

      // Appeler la fonction edge pour synchroniser avec Jellyfin
      const { error: syncError } = await supabase.functions.invoke('sync-approved-requests', {
        body: { requests: approvedRequests }
      });

      if (syncError) throw syncError;

      // Marquer les demandes comme synchronisées
      const requestIds = approvedRequests.map(req => req.id);
      const { error: updateError } = await supabase
        .from('media_requests')
        .update({ synced_to_jellyfin: true, synced_at: new Date().toISOString() })
        .in('id', requestIds);

      if (updateError) throw updateError;

      console.log(`${approvedRequests.length} demandes synchronisées avec Jellyfin`);
    } catch (error: any) {
      console.error("Erreur lors de la synchronisation:", error);
      throw error;
    }
  };

  const syncLibrary = async () => {
    try {
      // Appeler la fonction edge pour synchroniser la bibliothèque
      const { data, error: syncError } = await supabase.functions.invoke('sync-jellyfin-library', {
        body: { action: 'scan' }
      });

      if (syncError) throw syncError;

      if (data && !data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      // Mettre à jour les statistiques globales
      if (data?.globalStats) {
        setLibraryInfo({
          movieCount: data.globalStats.movieCount,
          seriesCount: data.globalStats.seriesCount,
        });
      }

      // Mettre à jour les bibliothèques détaillées
      if (data?.libraries) {
        setLibraries(data.libraries);
      }

      // Mettre à jour les statistiques catégorisées
      if (data?.categorizedStats) {
        setCategorizedStats(data.categorizedStats);
      }

      console.log("Bibliothèque Jellyfin synchronisée:", data);
    } catch (error: any) {
      console.error("Erreur lors de la synchronisation de la bibliothèque:", error);
      throw error;
    }
  };

  return (
    <JellyfinContext.Provider value={{ 
      serverInfo, 
      libraryInfo, 
      libraries,
      categorizedStats,
      users, 
      loading, 
      error, 
      syncUserToJellyfin, 
      syncApprovedRequests,
      syncLibrary,
      connectionStatus, 
      jellyfinUrl: settings.url 
    }}>
      {children}
    </JellyfinContext.Provider>
  );
};

export const useJellyfin = () => {
  const context = useContext(JellyfinContext);
  if (context === undefined) {
    throw new Error('useJellyfin must be used within a JellyfinProvider');
  }
  return context;
};