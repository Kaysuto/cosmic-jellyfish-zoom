import { useState, useRef, useEffect } from 'react';
import { Disc3, Volume2, SkipBack, Play, Pause, SkipForward } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useAudioStore } from "@/stores/audioStore";

const CustomAudioPlayer = () => {
  const { currentTrackIndex, isPlaying, volume, tracks, setCurrentTrackIndex, setIsPlaying, setVolume } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks && tracks.length > 0 ? tracks[currentTrackIndex] : null;

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.volume = volume / 100;
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Erreur lors de la lecture automatique :", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, volume, currentTrackIndex, tracks, currentTrack]);

  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleNextTrack = () => {
    if (!tracks || tracks.length === 0) return;
    // Correction: Passer directement le nouvel index calculé
    setCurrentTrackIndex((currentTrackIndex + 1) % tracks.length);
  };

  const handlePrevTrack = () => {
    if (!tracks || tracks.length === 0) return;
    // Correction: Passer directement le nouvel index calculé
    setCurrentTrackIndex((currentTrackIndex - 1 + tracks.length) % tracks.length);
  };

  if (!currentTrack) {
    return (
      <div className="flex items-center gap-3 bg-gray-800/30 rounded-full px-3 py-1.5 border border-gray-700/60 text-gray-500">
        <Disc3 className="h-4 w-4 text-gray-600" />
        <div className="text-xs truncate max-w-[120px]">Aucune piste disponible</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-gray-800/30 rounded-full px-3 py-1.5 border border-gray-700/60">
      <Disc3 className="h-4 w-4 text-purple-400" />
      
      <div className="text-xs truncate max-w-[120px]">
        {currentTrack.name.length > 15 
          ? `${currentTrack.name.substring(0, 15)}...` 
          : currentTrack.name}
      </div>
      
      <div className="flex items-center gap-1">
        <button className="p-1 text-gray-400 hover:text-white disabled:opacity-50" onClick={handlePrevTrack} disabled={!tracks || tracks.length === 0}>
          <SkipBack className="h-3 w-3" />
        </button>
        
        <button 
          className="p-1 text-white disabled:opacity-50"
          onClick={togglePlay}
          disabled={!tracks || tracks.length === 0}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>
        
        <button className="p-1 text-gray-400 hover:text-white disabled:opacity-50" onClick={handleNextTrack} disabled={!tracks || tracks.length === 0}>
          <SkipForward className="h-3 w-3" />
        </button>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-1 text-gray-400 hover:text-white disabled:opacity-50" disabled={!tracks || tracks.length === 0}>
            <Volume2 className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 bg-gray-800 border-gray-700">
          <Slider
            defaultValue={[volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="cursor-pointer"
          />
        </PopoverContent>
      </Popover>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
};

export default CustomAudioPlayer;