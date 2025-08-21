import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudioStore } from '@/stores/audioStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react';

const CustomAudioPlayer = () => {
  const { t } = useTranslation();
  const {
    isPlaying,
    currentTrackIndex,
    tracks,
    togglePlayPause,
    playNext,
    playPrev,
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
      <Card className="bg-gray-800/50 border-gray-700/50 text-white">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <Music className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold">{currentTrack?.title || '...'}</p>
              <p className="text-sm text-gray-400">{currentTrack?.artist || '...'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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