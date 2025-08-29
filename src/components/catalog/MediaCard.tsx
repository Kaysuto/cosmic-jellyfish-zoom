import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, PlusCircle } from 'lucide-react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { useSession } from '@/contexts/AuthContext';
import { useUserLists } from '@/hooks/useUserLists';
import { showSuccess, showError } from '@/utils/toast';

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  isAvailable?: boolean;
  jellyfin_id?: string;
  isRequested?: boolean;
}

interface MediaCardProps {
  item: MediaItem;
  showRequestButton?: boolean;
  onRequest?: (item: MediaItem) => void;
  onClick?: (item: MediaItem) => void;
}

const MediaCard = ({ item, showRequestButton = false, onRequest, onClick }: MediaCardProps) => {
  const { t } = useSafeTranslation();
  const { jellyfinUrl } = useJellyfin();
  const { session } = useSession();
  const { favorites, watchlist, addToList, removeFromList } = useUserLists(session?.user?.id);

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const rating = item.vote_average !== null && item.vote_average !== undefined ? item.vote_average.toFixed(1) : 'N/A';
  
  // Construire l'URL de l'image
  const getImageUrl = () => {
    if (!item.poster_path) return '';
    
    // Si c'est une URL complète (commence par http), l'utiliser directement
    if (item.poster_path.startsWith('http')) {
      return item.poster_path;
    }
    
    // Si c'est un chemin Jellyfin (commence par Items/), construire l'URL Jellyfin
    if (item.poster_path.startsWith('Items/') && jellyfinUrl) {
      return `${jellyfinUrl}/${item.poster_path}`;
    }
    
    // Sinon, utiliser TMDB
    return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
  };

  const isFavorite = favorites.has(item.id);
  const isWatchlisted = watchlist.has(item.id);

  const handleListAction = async (list: 'favorites' | 'watchlist', isAdded: boolean) => {
    try {
      if (isAdded) {
        await removeFromList(list, item.id);
        showSuccess(t('removed_from_list'));
      } else {
        await addToList(list, item.id, item.media_type);
        showSuccess(t('added_to_list'));
      }
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleRequestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ne pas permettre de demander si déjà demandé
    if (item.isRequested) {
      // Afficher un message informatif au lieu de bloquer complètement
      showSuccess('Vous avez déjà fait une demande pour ce média.');
      return;
    }
    
    if (onRequest) {
      onRequest(item);
    }
  };

  const cardContent = (
    <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02]">
      <CardContent className="p-0 relative">
        <img
          src={getImageUrl()}
          alt={title}
          className="w-full h-auto aspect-[2/3] object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback vers une image par défaut si l'image ne charge pas
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNTAgMjI1QzE2Ni41NjkgMjI1IDE4MCAyMTEuNTY5IDE4MCAxOTVDMTgwIDE3OC40MzEgMTY2LjU2OSAxNjUgMTUwIDE2NUMxMzMuNDMxIDE2NSAxMjAgMTc4LjQzMSAxMjAgMTk1QzEyMCAyMTEuNTY5IDEzMy40MzEgMjI1IDE1MCAyMjVaIiBmaWxsPSIjNjc3NDhCIi8+CjxwYXRoIGQ9Ik0xNTAgMjg1QzE4OC4yMjkgMjg1IDIyMCAyNTMuMjI5IDIyMCAyMTVDMjIwIDE3Ni43NzEgMTg4LjIyOSAxNDUgMTUwIDE0NUMxMTEuNzcxIDE0NSA4MCAxNzYuNzcxIDgwIDIxNUM4MCAyNTMuMjI5IDExMS43NzEgMjg1IDE1MCAyODVaIiBmaWxsPSIjNjc3NDhCIi8+Cjwvc3ZnPgo=';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {showRequestButton && !item.isAvailable && !item.isRequested && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 bg-blue-600 hover:bg-blue-700" 
              onClick={handleRequestClick}
            >
              <PlusCircle className="h-4 w-4 text-white" />
            </Button>
          )}
          {session && (
            <>
              <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/50 hover:bg-black/70" onClick={(e) => { e.preventDefault(); handleListAction('favorites', isFavorite); }}>
                <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`} />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/50 hover:bg-black/70" onClick={(e) => { e.preventDefault(); handleListAction('watchlist', isWatchlisted); }}>
                <Bookmark className={`h-4 w-4 ${isWatchlisted ? 'text-blue-500 fill-current' : 'text-white'}`} />
              </Button>
            </>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 text-white bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-sm truncate">{title}</h3>
          <div className="flex items-center justify-between text-xs mt-1">
            <span>{year}</span>
            <Badge variant="secondary">{rating}</Badge>
          </div>
        </div>

        {item.isAvailable && (
          <Badge className="absolute top-2 left-2 bg-green-600 text-white">{t('available')}</Badge>
        )}
        
        {item.isRequested && (
          <Badge className="absolute top-2 left-2 bg-orange-600 text-white">{t('requested')}</Badge>
        )}
      </CardContent>
    </Card>
  );

  // Si onClick est fourni, utiliser un div cliquable au lieu du Link
  if (onClick) {
    return (
      <div onClick={() => onClick(item)} className="group block cursor-pointer">
        {cardContent}
      </div>
    );
  }

  // Sinon, utiliser le Link normal
  return (
    <Link to={`/media/${item.media_type}/${item.id}`} className="group block">
      {cardContent}
    </Link>
  );
};

export default MediaCard;