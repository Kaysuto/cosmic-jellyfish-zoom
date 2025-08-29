import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
  updated_at: string;
  is_active?: boolean;
}

export const useProfile = () => {
  const { session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setError(error.message);
        
        // Si la table n'existe pas ou erreur 406, créer un profil temporaire
        if (error.code === 'PGRST116' || error.code === '406') {
          const fallbackProfile = {
            id: session.user.id,
            first_name: session.user.user_metadata?.full_name?.split(' ')[0] || session.user.email?.split('@')[0] || 'Utilisateur',
            last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
            email: session.user.email,
            role: 'user',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            updated_at: new Date().toISOString(),
            is_active: true
          };
          setProfile(fallbackProfile);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Exception in fetchProfile:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // Créer un profil temporaire en cas d'erreur
      const fallbackProfile = {
        id: session.user.id,
        first_name: session.user.user_metadata?.full_name?.split(' ')[0] || session.user.email?.split('@')[0] || 'Utilisateur',
        last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        email: session.user.email,
        role: 'user',
        avatar_url: session.user.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
        is_active: true
      };
      setProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refreshProfile: fetchProfile };
};