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
  audioRef: React.RefObject<HTMLAudioElement> | null;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  playTrack: (index: number) => void;
  setTracks: (tracks: Track[]) => void;
  setAudioRef: (ref: React.RefObject<HTMLAudioElement>) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isPlaying: false,
  currentTrackIndex: 0,
  tracks: [],
  audioRef: null,
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
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
  playTrack: (index: number) => {
    set({ currentTrackIndex: index, isPlaying: true });
  },
  setTracks: (tracks) => set({ tracks }),
  setAudioRef: (ref) => set({ audioRef: ref }),
}));