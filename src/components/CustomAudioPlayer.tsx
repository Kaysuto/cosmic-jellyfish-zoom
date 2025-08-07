import { useState, useRef, useEffect } from 'react';
import { Disc3, Volume2, SkipBack, Play, Pause, SkipForward } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { useAudioStore } from "@/stores/audioStore";

const CustomAudioPlayer = () => {
  const { 
    currentTrackIndex, 
    isPlaying, 
    volume, 
    tracks, 
    setCurrentTrackIndex, 
    setIsPlaying, 
    setVolume 
  } = useAudioStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // Handle mouse wheel over the volume button to change volume
  const handleVolumeWheel = (e: React.WheelEvent) => {
    // Prevent page scroll when adjusting volume via wheel on the control
    e.preventDefault();
    e.stopPropagation();

    // If Shift is pressed -> fine control
    const fine = e.shiftKey;
    const step = fine ? 1 : 5;
    const delta = e.deltaY;
    const newVolume = delta < 0 ? Math.min(100, volume + step) : Math.max(0, volume - step);
    setVolume(newVolume);
  };

  // Handle mouse wheel when hovering the slider area
  const handleSliderWheel = (e: React.WheelEvent) => {
    // Prevent page scroll when adjusting volume via wheel on slider
    e.preventDefault();
    e.stopPropagation();

    const fine = e.shiftKey;
    const step = fine ? 1 : 5;
    const delta = e.deltaY;
    const newVolume = delta < 0 ? Math.min(100, volume + step) : Math.max(0, volume - step);
    setVolume(newVolume);
  };

  if (!currentTrack) {
    return (
      <div className="flex items-center gap-3 bg-gray-800/30 rounded-full px-3 py-1.5 border border-gray-700/60 text-gray-500">
        <Disc3 className="h-4 w-4 text-gray-600" />
        <div className="text-xs truncate max-w-[120px]">Aucune piste disponible</div>
      </div>
    );
  }

  const isTruncated = currentTrack.name.length > 20;
  const displayName = isTruncated 
    ? `${currentTrack.name.substring(0, 20)}...` 
    : currentTrack.name;

  const TrackName = () => {
    if (isLoading) {
      return <>Chargement...</>;
    }
    if (isTruncated) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{displayName}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{currentTrack.name}</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return <>{displayName}</>;
  };

  return (
    <div className="flex items-center gap-3 bg-gray-800/30 rounded-full px-3 py-1.5 border border-gray-700/60">
      <Disc3 className={`h-4 w-4 text-purple-400 ${isPlaying ? 'animate-spin' : ''}`} />
      
      <div className="text-xs truncate max-w-[120px] text-white">
        <TrackName />
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
      
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button 
            ref={volumeButtonRef}
            onWheel={handleVolumeWheel}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-50 transition-colors relative" 
            disabled={!tracks || tracks.length === 0}
            aria-label="Volume (utilisez la molette pour régler, maintenez Shift pour affiner)"
            title="Utilisez la molette pour régler le volume (Shift = fin)"
          >
            <Volume2 className="h-3 w-3" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-44 bg-gray-800 border-gray-700">
          <div className="space-y-2">
            <div className="text-xs text-gray-400 text-center">Volume: {volume}%</div>
            {/* Wrap the Slider so we can catch onWheel on the slider area */}
            <div onWheel={handleSliderWheel} className="px-3 py-1">
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
                aria-label="Volume slider"
              />
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      <audio 
        ref={audioRef} 
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default CustomAudioPlayer;