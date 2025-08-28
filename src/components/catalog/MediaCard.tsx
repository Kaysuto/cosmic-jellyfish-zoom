import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, PlayCircle, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
}

interface MediaCardProps {
  item: MediaItem;
  showRequestButton?: boolean;
  onRequest?: (item: MediaItem) => void;
}

const MediaCard = ({ item, showRequestButton = false, onRequest }: MediaCardProps) => {
  const { t } = useTranslation();
  const { jellyfinUrl } = useJellyfin();
  const { session } = useSession();
  const { favorites, watchlist, addToList, removeFromList } = useUserLists(session?.user?.id);

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

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
    if (onRequest) {
      onRequest(item);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.jellyfin_id && jellyfinUrl) {
      window.open(`${jellyfinUrl}/web/index.html#!/details?id=${item.jellyfin_id}`, '_blank');
    }
  };

  return (
    <Link to={`/${item.media_type}/${item.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105">
        <CardContent className="p-0 relative">
          <img
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={title}
            className="w-full h-auto aspect-[2/3] object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
            <h3 className="font-bold truncate">{title}</h3>
            <div className="flex items-center justify-between text-xs mt-1">
              <span>{year}</span>
              <Badge variant="secondary">{rating}</Badge>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {item.isAvailable ? (
              <Button size="icon" variant="ghost" className="h-16 w-16 bg-black/50 hover:bg-black/70" onClick={handlePlayClick}>
                <PlayCircle className="h-10 w-10 text-white" />
              </Button>
            ) : showRequestButton && (
              <Button size="icon" variant="ghost" className="h-16 w-16 bg-black/50 hover:bg-black/70" onClick={handleRequestClick}>
                <PlusCircle className="h-10 w-10 text-white" />
              </Button>
            )}
          </div>

          {item.isAvailable && (
            <Badge className="absolute top-2 left-2 bg-green-600 text-white">{t('available')}</Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default MediaCard;