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
  tracks: [
    // Remplacez ces URLs par les URLs de vos propres fichiers audio
    { name: 'Ma Musique Chill', url: 'https://votre-domaine.com/musiques/ma-musique-chill.mp3' },
    { name: 'Rythme Lofi', url: 'https://votre-domaine.com/musiques/rythme-lofi.mp3' },
    { name: 'Ambiance Électro', url: 'https://votre-domaine.com/musiques/ambiance-electro.mp3' },
  ],
  setCurrentTrackIndex: (index) => set({ currentTrackIndex: index }),
  setIsPlaying: (isPlaying) => set({ isPlaying: isPlaying }),
  setVolume: (volume) => set({ volume: volume }),
  setTracks: (tracks) => set({ tracks }),
}));