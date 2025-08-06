import { create } from 'zustand';

interface AudioState {
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  tracks: { name: string; url: string }[];
  tracksLoading: boolean;
  setCurrentTrackIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  fetchTracks: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentTrackIndex: 0,
  isPlaying: false,
  volume: 50,
  tracks: [],
  tracksLoading: true,
  setCurrentTrackIndex: (index) => set({ currentTrackIndex: index }),
  setIsPlaying: (isPlaying) => set({ isPlaying: isPlaying }),
  setVolume: (volume) => set({ volume: volume }),
  fetchTracks: async () => {
    if (get().tracks.length > 0) return; // Ne pas re-fetcher si les pistes sont déjà là
    try {
      set({ tracksLoading: true });
      const response = await fetch('/audio/tracks.json');
      const tracksList = await response.json();
      const randomTrackIndex = Math.floor(Math.random() * tracksList.length);
      set({ 
        tracks: tracksList, 
        currentTrackIndex: randomTrackIndex,
        tracksLoading: false 
      });
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
      set({ tracksLoading: false });
    }
  },
}));