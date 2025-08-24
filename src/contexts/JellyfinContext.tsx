import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface JellyfinContextType {
  jellyfinUrl: string | null;
  loading: boolean;
  error: string | null;
}

const JellyfinContext = createContext<JellyfinContextType>({
  jellyfinUrl: null,
  loading: true,
  error: null,
});

export const JellyfinProvider = ({ children }: { children: ReactNode }) => {
  const [jellyfinUrl, setJellyfinUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJellyfinUrl = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('jellyfin_public_url')
        .select('url')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching Jellyfin URL from view:", error);
        setError(error.message);
      } else if (data) {
        setJellyfinUrl(data.url);
      }
      setLoading(false);
    };

    fetchJellyfinUrl();
  }, []);

  return (
    <JellyfinContext.Provider value={{ jellyfinUrl, loading, error }}>
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