import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { useSession } from '@/contexts/AuthContext';

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  isAvailable?: boolean;
  jellyfin_id?: string;
  overview?: string;
}

interface MediaCardWithPlayProps {
  item: MediaItem;
}

const MediaCardWithPlay = ({ item }: MediaCardWithPlayProps) => {
  const { t } = useSafeTranslation();
  const { jellyfinUrl } = useJellyfin();
  const { session } = useSession();

  const title = item.title || item.name;
  const backdrop = item.backdrop_path || item.poster_path;
  
  // Construire l'URL de l'image
  const getImageUrl = () => {
    if (!backdrop) return '';
    
    // Si c'est une URL complète (commence par http), l'utiliser directement
    if (backdrop.startsWith('http')) {
      return backdrop;
    }
    
    // Si c'est un chemin Jellyfin (commence par Items/), construire l'URL Jellyfin
    if (backdrop.startsWith('Items/') && jellyfinUrl) {
      return `${jellyfinUrl}/${backdrop}`;
    }
    
    // Sinon, utiliser TMDB
    return `https://image.tmdb.org/t/p/w780${backdrop}`;
  };



  return (
    <Card className="overflow-hidden group relative w-full aspect-[2/3]">
      <img
        src={getImageUrl()}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        onError={(e) => {
          // Fallback vers une image par défaut si l'image ne charge pas
          const target = e.target as HTMLImageElement;
          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNTAgMjI1QzE2Ni41NjkgMjI1IDE4MCAyMTEuNTY5IDE4MCAxOTVDMTgwIDE3OC40MzEgMTY2LjU2OSAxNjUgMTUwIDE2NUMxMzMuNDMxIDE2NSAxMjAgMTc4LjQzMSAxMjAgMTk1QzEyMCAyMTEuNTY5IDEzMy40MzEgMjI1IDE1MCAyMjVaIiBmaWxsPSIjNjc3NDhCIi8+CjxwYXRoIGQ9Ik0xNTAgMjg1QzE4OC4yMjkgMjg1IDIyMCAyNTMuMjI5IDIyMCAyMTVDMjIwIDE3Ni43NzEgMTg4LjIyOSAxNDUgMTUwIDE0NUMxMTEuNzcxIDE0NSA4MCAxNzYuNzcxIDgwIDIxNUM4MCAyNTMuMjI5IDExMS43NzEgMjg1IDE1MCAyODVaIiBmaWxsPSIjNjc3NDhCIi8+Cjwvc3ZnPgo=';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <h3 className="text-sm font-bold leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">{title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{item.overview}</p>
      </div>
    </Card>
  );
};

export default MediaCardWithPlay;