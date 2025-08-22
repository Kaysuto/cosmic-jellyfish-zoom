import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface JellyfinContextType {
  jellyfinUrl: string | null;
  loading: boolean;
}

const JellyfinContext = createContext<JellyfinContextType>({
  jellyfinUrl: null,
  loading: true,
});

export const JellyfinProvider = ({ children }: { children: ReactNode }) => {
  const [jellyfinUrl, setJellyfinUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJellyfinUrl = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('jellyfin_settings')
        .select('url')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching Jellyfin URL:", error);
      } else if (data) {
        setJellyfinUrl(data.url);
      }
      setLoading(false);
    };

    fetchJellyfinUrl();
  }, []);

  return (
    <JellyfinContext.Provider value={{ jellyfinUrl, loading }}>
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