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

interface JellyfinUser {
  Id: string;
  Name: string;
}

export interface JellyfinContextType {
  serverInfo: JellyfinServerInfo | null;
  libraryInfo: JellyfinLibraryInfo | null;
  users: JellyfinUser[] | null;
  loading: boolean;
  error: string | null;
  syncUserToJellyfin: (userId: string) => Promise<void>;
  connectionStatus: 'connected' | 'disconnected' | 'loading';
  jellyfinUrl: string;
}

const JellyfinContext = createContext<JellyfinContextType | undefined>(undefined);

export const JellyfinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, loading: settingsLoading } = useJellyfinSettings();
  const [serverInfo, setServerInfo] = useState<JellyfinServerInfo | null>(null);
  const [libraryInfo, setLibraryInfo] = useState<JellyfinLibraryInfo | null>(null);
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

  return (
    <JellyfinContext.Provider value={{ serverInfo, libraryInfo, users, loading, error, syncUserToJellyfin, connectionStatus, jellyfinUrl: settings.url }}>
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