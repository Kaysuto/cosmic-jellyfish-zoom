import { create } from 'zustand';

interface Track {
  title: string;
  artist: string;
  url: string;
}

interface AudioState {
  isPlaying: boolean;
  currentTrackIndex: number;
  tracks: Track[];
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrackIndex: (index: number) => void;
  playNext: () => void;
  playPrev: () => void;
  setTracks: (tracks: Track[]) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isPlaying: false,
  currentTrackIndex: 0,
  tracks: [],
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTrackIndex: (index) => set({ currentTrackIndex: index }),
  playNext: () => {
    const { tracks, currentTrackIndex } = get();
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    set({ currentTrackIndex: nextIndex, isPlaying: true });
  },
  playPrev: () => {
    const { tracks, currentTrackIndex } = get();
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    set({ currentTrackIndex: prevIndex, isPlaying: true });
  },
  setTracks: (tracks) => set({ tracks }),
}));