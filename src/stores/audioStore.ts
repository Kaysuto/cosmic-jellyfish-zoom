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

export const useAudioStore = create<AudioState>((set) => ({
  currentTrackIndex: 0,
  isPlaying: false,
  volume: 50,
  tracks: [],
  setCurrentTrackIndex: (index) => set({ currentTrackIndex: index }),
  setIsPlaying: (isPlaying) => set({ isPlaying: isPlaying }),
  setVolume: (volume) => set({ volume: volume }),
  setTracks: (tracks) => set({ tracks }),
}));