import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useSession } from '@/contexts/AuthContext';
import { useUserListDetails } from '@/hooks/useUserListDetails';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Bookmark } from 'lucide-react';
import MediaGrid from './MediaGrid';

const WatchlistSection = () => {
  const { t } = useSafeTranslation();
  const { session } = useSession();
  const { list: watchlist, loading: watchlistLoading, refetch: refetchWatchlist } = useUserListDetails(
    session?.user?.id || '', 
    'watchlist'
  );

  // Ne pas afficher la section si l'utilisateur n'est pas connecté
  if (!session?.user) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bookmark className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">{t('watchlist')}</h2>
          <Badge variant="secondary">{watchlist.length}</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetchWatchlist}
          disabled={watchlistLoading}
        >
          <RefreshCw className={`h-4 w-4 ${watchlistLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {watchlistLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : watchlist.length > 0 ? (
        <MediaGrid items={watchlist} showRequestButton={false} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg mb-2">{t('no_watchlist_yet')}</CardTitle>
            <CardDescription>{t('start_adding_watchlist')}</CardDescription>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default WatchlistSection;
