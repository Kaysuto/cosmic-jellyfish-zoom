import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';

// Cache global pour éviter les requêtes multiples
let globalRequestCache: Set<number> | null = null;
let globalCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useRequestStatus = (mediaIds: number[]) => {
  const { session } = useSession();
  const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stabiliser les mediaIds pour éviter les re-rendus inutiles
  const stableMediaIds = useMemo(() => mediaIds, [JSON.stringify(mediaIds)]);
  const stableUserId = useMemo(() => session?.user?.id, [session?.user?.id]);

  const fetchRequestStatus = useCallback(async () => {
    if (!stableUserId || stableMediaIds.length === 0) {
      setLoading(false);
      return;
    }

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau contrôleur d'annulation
    abortControllerRef.current = new AbortController();
    
    setLoading(true);

    try {
      // Vérifier si le cache est encore valide
      const now = Date.now();
      if (globalRequestCache && (now - globalCacheTimestamp) < CACHE_DURATION) {
        // Utiliser le cache
        const filteredIds = stableMediaIds.filter(id => globalRequestCache!.has(id));
        setRequestedIds(new Set(filteredIds));
        setLoading(false);
        return;
      }

      // Récupérer toutes les demandes de l'utilisateur
      const { data, error } = await supabase
        .from('media_requests')
        .select('tmdb_id')
        .eq('user_id', stableUserId);

      // Vérifier si la requête a été annulée
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (error) {
        console.error('Error fetching request status:', error);
      } else {
        // Mettre à jour le cache global
        globalRequestCache = new Set(data.map(item => item.tmdb_id));
        globalCacheTimestamp = now;
        
        // Filtrer seulement les IDs qui nous intéressent
        const filteredIds = stableMediaIds.filter(id => globalRequestCache!.has(id));
        setRequestedIds(new Set(filteredIds));
      }
    } catch (error) {
      // Ignorer les erreurs d'annulation
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Error in fetchRequestStatus:', error);
    } finally {
      setLoading(false);
    }
  }, [stableMediaIds, stableUserId]);

  useEffect(() => {
    fetchRequestStatus();

    // Cleanup function pour annuler les requêtes en cours
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchRequestStatus]);

  // Fonction pour ajouter manuellement un ID à la liste des demandes
  const addRequestedId = useCallback((id: number) => {
    setRequestedIds(prev => new Set([...prev, id]));
    // Mettre à jour le cache global
    if (globalRequestCache) {
      globalRequestCache.add(id);
    }
  }, []);

  // Fonction pour rafraîchir les statuts
  const refreshStatus = useCallback(() => {
    // Invalider le cache
    globalRequestCache = null;
    globalCacheTimestamp = 0;
    fetchRequestStatus();
  }, [fetchRequestStatus]);

  // Fonction pour rafraîchir et ajouter un ID (utilisée après création d'une demande)
  const addRequestedIdAndRefresh = useCallback(async (id: number) => {
    // Ajouter immédiatement à l'état local
    setRequestedIds(prev => new Set([...prev, id]));
    // Mettre à jour le cache global
    if (globalRequestCache) {
      globalRequestCache.add(id);
    }
    // Puis rafraîchir depuis la base de données pour s'assurer de la synchronisation
    await fetchRequestStatus();
  }, [fetchRequestStatus]);

  // Fonction pour forcer la mise à jour immédiate (utilisée quand on sait qu'une demande existe)
  const forceRefresh = useCallback(async () => {
    // Invalider le cache
    globalRequestCache = null;
    globalCacheTimestamp = 0;
    await fetchRequestStatus();
  }, [fetchRequestStatus]);

  return { requestedIds, loading, addRequestedId, refreshStatus, addRequestedIdAndRefresh, forceRefresh };
};