import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { jellyfinUrl } = useJellyfin();
  const { session } = useSession();

  const title = item.title || item.name;
  const backdrop = item.backdrop_path || item.poster_path;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.jellyfin_id && jellyfinUrl) {
      window.open(`${jellyfinUrl}/web/index.html#!/details?id=${item.jellyfin_id}`, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden group relative w-full aspect-video">
      <img
        src={`https://image.tmdb.org/t/p/w780${backdrop}`}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-lg font-bold truncate">{title}</h3>
        <p className="text-xs text-muted-foreground truncate h-8">{item.overview}</p>
        <div className="flex items-center space-x-2 mt-2">
          <Button size="sm" onClick={handlePlayClick}>
            <PlayCircle className="mr-2 h-4 w-4" />
            {t('play')}
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link to={`/${item.media_type}/${item.id}`}>
              <Info className="mr-2 h-4 w-4" />
              {t('view_details')}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MediaCardWithPlay;