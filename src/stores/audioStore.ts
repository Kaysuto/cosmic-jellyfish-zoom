import { create } from 'zustand';

interface AudioState {
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  tracks: { name: string; url: string }[];
  setCurrentTrackIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setTracks: (tracks: { name: string; url: string }[]) => void;
}

// Fonction pour récupérer le volume initial depuis le localStorage en toute sécurité
const getInitialVolume = (): number => {
  try {
    const savedVolume = localStorage.getItem('audioPlayerVolume');
    if (savedVolume !== null) {
      const parsedVolume = parseInt(savedVolume, 10);
      // S'assurer que la valeur est un nombre valide entre 0 et 100
      if (!isNaN(parsedVolume) && parsedVolume >= 0 && parsedVolume <= 100) {
        return parsedVolume;
      }
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du volume depuis le localStorage:', error);
  }
  return 50; // Volume par défaut si rien n'est trouvé ou en cas d'erreur
};

export const useAudioStore = create<AudioState>((set) => ({
  currentTrackIndex: 0,
  isPlaying: false,
  volume: getInitialVolume(),
  tracks: [],
  setCurrentTrackIndex: (index) => set({ currentTrackIndex: index }),
  setIsPlaying: (isPlaying) => set({ isPlaying: isPlaying }),
  setVolume: (volume) => {
    try {
      // Sauvegarder le volume dans le localStorage
      localStorage.setItem('audioPlayerVolume', volume.toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du volume dans le localStorage:', error);
    }
    // Mettre à jour l'état
    set({ volume });
  },
  setTracks: (tracks) => set({ tracks }),
}));