import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudioStore } from '@/stores/audioStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, SkipForward, SkipBack, Music, Volume2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const CustomAudioPlayer = () => {
  const { t } = useTranslation();
  const {
    isPlaying,
    currentTrackIndex,
    tracks,
    togglePlayPause,
    playNext,
    playPrev,
    playTrack,
    setTracks,
    setAudioRef,
  } = useAudioStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setAudioRef(audioRef);
  }, [setAudioRef]);

  useEffect(() => {
    fetch('/audio/tracks.json')
      .then(res => res.json())
      .then(data => setTracks(data));
  }, [setTracks]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const currentTrack = tracks[currentTrackIndex];

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-white text-center sm:text-left">{t('custom_audio_player_title')}</h3>
      <Card className="bg-gray-800/50 border-gray-700/50 text-white overflow-hidden h-[352px] flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <Music className="h-6 w-6 text-gray-400" />
            </div>
            <div className="truncate">
              <p className="font-semibold truncate">{currentTrack?.title || '...'}</p>
              <p className="text-sm text-gray-400 truncate">{currentTrack?.artist || '...'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={playPrev} disabled={tracks.length === 0}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={togglePlayPause} disabled={tracks.length === 0}>
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext} disabled={tracks.length === 0}>
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <CardContent className="p-0 flex-grow">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {tracks.map((track, index) => (
                <button
                  key={index}
                  onClick={() => playTrack(index)}
                  className={cn(
                    "w-full text-left p-2 rounded-md flex items-center gap-3 transition-colors hover:bg-gray-700/50",
                    currentTrackIndex === index && "bg-gray-700"
                  )}
                >
                  <div className="flex-shrink-0 w-6 text-center">
                    {currentTrackIndex === index && isPlaying ? (
                      <Volume2 className="h-4 w-4 text-blue-400 animate-pulse" />
                    ) : (
                      <span className="text-sm text-gray-400">{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">{track.title}</p>
                    <p className="text-xs text-gray-400">{track.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onEnded={playNext}
          preload="auto"
        />
      )}
    </div>
  );
};

export default CustomAudioPlayer;