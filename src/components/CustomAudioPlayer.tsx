import { useState, useRef, useEffect } from 'react';
import { Disc3, Volume2, SkipBack, Play, Pause, SkipForward } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useAudioStore } from "@/stores/audioStore";

const CustomAudioPlayer = () => {
  const { 
    currentTrackIndex, 
    isPlaying, 
    volume, 
    tracks,
    tracksLoading,
    setCurrentTrackIndex, 
    setIsPlaying, 
    setVolume,
    fetchTracks
  } = useAudioStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const currentTrack = tracks && tracks.length > 0 ? tracks[currentTrackIndex] : null;

  // Gestion de la lecture/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      if (isPlaying) {
        audio.play().catch(console.error);
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    const handleError = () => {
      setIsLoading(false);
      console.error('Erreur de lecture audio pour:', currentTrack.name);
      handleNextTrack();
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Charger la nouvelle piste
    audio.src = currentTrack.url;
    audio.volume = volume / 100;
    audio.load();

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrackIndex, currentTrack]);

  // Gestion du volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Gestion play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, isLoading]);

  const togglePlay = () => {
    if (!currentTrack || isLoading) return;
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleNextTrack = () => {
    if (!tracks || tracks.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
  };

  const handlePrevTrack = () => {
    if (!tracks || tracks.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIndex);
  };

  if (tracksLoading) {
    return (
      <div className="flex items-center gap-3 bg-gray-800/30 rounded-full px-3 py-1.5 border border-gray-700/60 text-gray-500">
        <Disc3 className="h-4 w-4 text-gray-600 animate-spin" />
        <div className="text-xs truncate max-w-[120px]">Chargement...</div>
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className="flex items-center gap-3 bg-gray-800/30 rounded-full px-3 py-1.5 border border-gray-700/60 text-gray-500">
        <Disc3 className="h-4 w-4 text-gray-600" />
        <div className="text-xs truncate max-w-[120px]">Aucune piste</div>
      </div>
    );
  }

  const displayName = currentTrack.name.length > 20 
    ? `${currentTrack.name.substring(0, 20)}...` 
    : currentTrack.name;

  return (
    <div className="flex items-center gap-3 bg-gray-800/30 rounded-full px-3 py-1.5 border border-gray-700/60">
      <Disc3 className={`h-4 w-4 text-purple-400 ${isPlaying ? 'animate-spin' : ''}`} />
      
      <div className="text-xs truncate max-w-[120px] text-white">
        {isLoading ? 'Chargement...' : displayName}
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          className="p-1 text-gray-400 hover:text-white disabled:opacity-50 transition-colors" 
          onClick={handlePrevTrack} 
          disabled={!tracks || tracks.length === 0 || isLoading}
        >
          <SkipBack className="h-3 w-3" />
        </button>
        
        <button 
          className="p-1 text-white disabled:opacity-50 transition-colors"
          onClick={togglePlay}
          disabled={!tracks || tracks.length === 0 || isLoading}
        >
          {isLoading ? (
            <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </button>
        
        <button 
          className="p-1 text-gray-400 hover:text-white disabled:opacity-50 transition-colors" 
          onClick={handleNextTrack} 
          disabled={!tracks || tracks.length === 0 || isLoading}
        >
          <SkipForward className="h-3 w-3" />
        </button>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <button 
            className="p-1 text-gray-400 hover:text-white disabled:opacity-50 transition-colors" 
            disabled={!tracks || tracks.length === 0}
          >
            <Volume2 className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 bg-gray-800 border-gray-700">
          <div className="space-y-2">
            <div className="text-xs text-gray-400 text-center">Volume: {volume}%</div>
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="cursor-pointer"
            />
          </div>
        </PopoverContent>
      </Popover>

      <audio 
        ref={audioRef} 
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default CustomAudioPlayer;