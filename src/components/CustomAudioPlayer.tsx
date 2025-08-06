import { useState, useRef, useEffect } from 'react';
import { Disc3, Volume2, SkipBack, Play, Pause, SkipForward } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useAudioStore } from "@/stores/audioStore";

const CustomAudioPlayer = () => {
  const { currentTrackIndex, isPlaying, volume, tracks, setCurrentTrackIndex, setIsPlaying, setVolume } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, volume, currentTrackIndex, tracks]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prevIndex: number) => (prevIndex + 1) % tracks.length);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prevIndex: number) => (prevIndex - 1 + tracks.length) % tracks.length);
  };

  return (
    <div className="flex items-center gap-3 bg-gray-800/30 rounded-full px-3 py-1.5 border border-gray-700/60">
      <Disc3 className="h-4 w-4 text-purple-400" />
      
      <div className="text-xs truncate max-w-[120px]">
        {currentTrack.name.length > 15 
          ? `${currentTrack.name.substring(0, 15)}...` 
          : currentTrack.name}
      </div>
      
      <div className="flex items-center gap-1">
        <button className="p-1 text-gray-400 hover:text-white" onClick={handlePrevTrack}>
          <SkipBack className="h-3 w-3" />
        </button>
        
        <button 
          className="p-1 text-white"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>
        
        <button className="p-1 text-gray-400 hover:text-white" onClick={handleNextTrack}>
          <SkipForward className="h-3 w-3" />
        </button>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-1 text-gray-400 hover:text-white">
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

      <audio ref={audioRef} preload="metadata">
        <source src={currentTrack.url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default CustomAudioPlayer;