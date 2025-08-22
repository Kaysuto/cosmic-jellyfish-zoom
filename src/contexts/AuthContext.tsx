import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // This prevents re-renders on token refreshes.
      // The session object is updated only when the user logs in or out.
      setSession(currentSession => {
        if (currentSession?.user.id === newSession?.user.id) {
          return currentSession;
        }
        return newSession;
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useSession = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return context;
};