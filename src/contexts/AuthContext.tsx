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
    // La méthode onAuthStateChange notifie immédiatement de l'état de la session au chargement,
    // puis écoute les changements (connexion, déconnexion, rafraîchissement du jeton).
    // Si le rafraîchissement échoue, elle renverra une session `null`.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    loading,
  };

  // Ne rend les enfants que lorsque le chargement est terminé pour éviter les affichages incorrects
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useSession = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return context;
};