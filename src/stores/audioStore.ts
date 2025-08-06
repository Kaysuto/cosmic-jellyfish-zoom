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
      if (!isNaN(parsedVolume) && parsedVolume >= 0 && parsedVolume <= 100) {
        return parsedVolume;
      }
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du volume depuis le localStorage:', error);
  }
  return 50;
};

// Fonction pour récupérer l'index de la piste depuis le sessionStorage
const getInitialTrackIndex = (): number => {
  try {
    const savedIndex = sessionStorage.getItem('audioPlayerTrackIndex');
    if (savedIndex !== null) {
      const parsedIndex = parseInt(savedIndex, 10);
      if (!isNaN(parsedIndex)) {
        return parsedIndex;
      }
    }
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'index depuis le sessionStorage:', error);
  }
  return 0;
};

// Fonction pour récupérer l'état de lecture initial depuis le sessionStorage
const getInitialIsPlaying = (): boolean => {
  try {
    const savedIsPlaying = sessionStorage.getItem('audioPlayerIsPlaying');
    return savedIsPlaying === 'true';
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'état de lecture depuis le sessionStorage:', error);
    return false;
  }
};

export const useAudioStore = create<AudioState>((set) => ({
  currentTrackIndex: getInitialTrackIndex(),
  isPlaying: getInitialIsPlaying(),
  volume: getInitialVolume(),
  tracks: [],
  setCurrentTrackIndex: (index) => {
    try {
      sessionStorage.setItem('audioPlayerTrackIndex', index.toString());
      // Réinitialiser le temps de lecture sauvegardé lors du changement de piste
      sessionStorage.setItem('audioPlayerCurrentTime', '0');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'index dans le sessionStorage:', error);
    }
    set({ currentTrackIndex: index });
  },
  setIsPlaying: (isPlaying) => {
    try {
      sessionStorage.setItem('audioPlayerIsPlaying', isPlaying.toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'état de lecture dans le sessionStorage:', error);
    }
    set({ isPlaying });
  },
  setVolume: (volume) => {
    try {
      localStorage.setItem('audioPlayerVolume', volume.toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du volume dans le localStorage:', error);
    }
    set({ volume });
  },
  setTracks: (tracks) => set({ tracks }),
}));