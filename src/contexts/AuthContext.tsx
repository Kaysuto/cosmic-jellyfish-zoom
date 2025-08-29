import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Guard pour éviter les logs SIGNED_IN en boucle
  const lastSignedInUserRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          console.log('Initial session loaded:', initialSession?.user?.email);
          setSession(initialSession);
        }
      } catch (err) {
        console.error('Exception getting initial session:', err);
      } finally {
        // Attendre un peu avant de désactiver le loading pour éviter les flashs
        setTimeout(() => setLoading(false), 100);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Mettre à jour la session immédiatement
      setSession(session);

      // Guard pour ne logger qu'une fois par utilisateur
      if (event === 'SIGNED_IN' && session) {
        const email = session.user.email ?? null;
        if (lastSignedInUserRef.current !== email) {
          console.log('Auth state changed:', event, email);
          console.log('User signed in successfully:', email);
          lastSignedInUserRef.current = email;
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('Auth state changed:', event, session?.user?.email);
        console.log('User signed out');
        lastSignedInUserRef.current = null;
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Auth state changed:', event, session.user.email);
        console.log('Token refreshed for:', session.user.email);
        // Ne pas changer le loading pour les refresh de token
      } else if (event === 'INITIAL_SESSION') {
        // L'événement INITIAL_SESSION est géré par getInitialSession
        console.log('Auth state changed:', event, session?.user?.email);
        console.log('Initial session event received');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    loading,
  };

  // Rendre toujours les enfants, la gestion du loading se fait dans les composants
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSession = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return context;
};