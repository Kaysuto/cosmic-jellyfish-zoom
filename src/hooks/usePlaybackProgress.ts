import { useEffect, useRef } from 'react';
import { useSession } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PlaybackProgressData {
  tmdbId: number;
  mediaType: string;
  season?: number | null;
  episode?: number | null;
  position: number;
  totalDuration?: number;
}

export const usePlaybackProgress = () => {
  const { session } = useSession();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPositionRef = useRef<number>(0);

  useEffect(() => {
    if (!session?.user) return;

    const handlePlaybackProgress = async (event: CustomEvent<PlaybackProgressData>) => {
      const { tmdbId, mediaType, season, episode, position, totalDuration } = event.detail;
      
      // Éviter de sauvegarder trop fréquemment (toutes les 5 secondes minimum)
      const timeSinceLastSave = position - lastSavedPositionRef.current;
      if (timeSinceLastSave < 5) {
        return;
      }

      // Annuler la sauvegarde précédente si elle est en cours
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Sauvegarder après un délai de 2 secondes pour éviter les sauvegardes trop fréquentes
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          // Utiliser la durée totale fournie par le lecteur ou une valeur par défaut
          const totalSeconds = totalDuration || 0;
          const progressSeconds = position;

          // Sauvegarder la progression avec upsert
          const { error: upsertError } = await supabase
            .from('playback_progress')
            .upsert({
              user_id: session.user.id,
              tmdb_id: tmdbId,
              media_type: mediaType,
              season_number: season || -1,
              episode_number: episode || -1,
              progress_seconds: progressSeconds,
              total_seconds: totalSeconds,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,tmdb_id,media_type,season_number,episode_number'
            });

          if (upsertError) {
            console.error('Error saving playback progress:', upsertError);
            return;
          }

          lastSavedPositionRef.current = position;

          // Dispatch l'événement de sauvegarde réussie
          window.dispatchEvent(new CustomEvent('playback-progress-saved', {
            detail: { tmdbId, mediaType, season, episode }
          }));

        } catch (error) {
          console.error('Error in playback progress handler:', error);
        }
      }, 2000);
    };

    window.addEventListener('playback-progress', handlePlaybackProgress as EventListener);

    return () => {
      window.removeEventListener('playback-progress', handlePlaybackProgress as EventListener);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [session]);
};
