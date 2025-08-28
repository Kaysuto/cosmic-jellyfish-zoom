import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserById } from '@/hooks/useUserById';
import { useRequestsByUserId } from '@/hooks/useRequestsByUserId';
import { useUserListDetails } from '@/hooks/useUserListDetails';
import MediaGrid, { MediaItem } from '@/components/catalog/MediaGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Heart, 
  Bookmark, 
  RefreshCw,
  Calendar,
  Film,
  Tv,
  MailQuestion
} from 'lucide-react';
import { getGravatarURL } from '@/lib/gravatar';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useSession } from '@/contexts/AuthContext';

const UserPublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { t, i18n } = useTranslation();
  const { user, loading: userLoading } = useUserById(userId);
  const { requests, loading: requestsLoading } = useRequestsByUserId(userId);
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const currentLocale = i18n.language === 'fr' ? fr : enUS;
  const isOwner = session?.user?.id === userId;

  // Hooks pour les listes utilisateur (seulement si c'est le propriétaire)
  const { list: favorites, loading: favoritesLoading, refetch: refetchFavorites } = useUserListDetails(userId || '', 'favorite');
  const { list: watchlist, loading: watchlistLoading, refetch: refetchWatchlist } = useUserListDetails(userId || '', 'watchlist');

  const statusConfig = {
    pending: { text: t('status_pending'), className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    approved: { text: t('status_approved'), className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    rejected: { text: t('status_rejected'), className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    available: { text: t('status_available'), className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );

  if (userLoading || requestsLoading || favoritesLoading || watchlistLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8 text-center">{t('user_not_found')}</div>;
  }

  const ProfileInfoCard = () => (
    <Card className="h-full">
      <CardHeader className="text-center pb-4">
        <div className="relative mx-auto mb-4">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={user.avatar_url || getGravatarURL(user.email, 160)} />
            <AvatarFallback className="text-3xl">
              {user.first_name?.charAt(0)}
              {user.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-2xl">{user.first_name} {user.last_name}</CardTitle>
        <p className="text-muted-foreground text-sm">{user.email}</p>
        <Badge variant="secondary" className="mt-2">
          <Calendar className="h-3 w-3 mr-1" />
          {t('member_since')} {format(new Date(user.updated_at), 'MMMM yyyy', { locale: currentLocale })}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t('first_name')}</p>
            <p className="font-medium">{user.first_name || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('last_name')}</p>
            <p className="font-medium">{user.last_name || '-'}</p>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">{t('email')}</p>
          <p className="font-medium text-sm">{user.email}</p>
        </div>
      </CardContent>
    </Card>
  );

  const RequestsCard = () => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MailQuestion className="h-5 w-5" />
          <CardTitle>{t('media_requests')}</CardTitle>
          <Badge variant="secondary">{requests.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {requests.map((request) => (
              <Link to={`/media/${request.media_type}/${request.tmdb_id}`} key={request.id}>
                <Card className="overflow-hidden group transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="relative aspect-[2/3]">
                    {request.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w500${request.poster_path}`} alt={request.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        {request.media_type === 'movie' ? <Film className="h-12 w-12" /> : <Tv className="h-12 w-12" />}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={statusConfig[request.status]?.className}>{statusConfig[request.status]?.text}</Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold truncate text-sm">{request.title}</h4>
                    <div className="mt-1 flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user.avatar_url || getGravatarURL(user.email, 80)} />
                        <AvatarFallback className="text-[10px]">
                          {user.first_name?.charAt(0)}
                          {user.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] text-muted-foreground">
                        {t('requested_by')} {user.first_name} {user.last_name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(request.requested_at), 'd MMM yyyy', { locale: currentLocale })}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MailQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('no_requests_yet')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const FavoritesCard = () => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <CardTitle>{t('favorites')}</CardTitle>
            <Badge variant="secondary">{favorites.length}</Badge>
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={refetchFavorites}
              disabled={favoritesLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${favoritesLoading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {favoritesLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : favorites.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <MediaGrid items={favorites} showRequestButton={false} />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('no_favorites_yet')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const WatchlistCard = () => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            <CardTitle>{t('watchlist')}</CardTitle>
            <Badge variant="secondary">{watchlist.length}</Badge>
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={refetchWatchlist}
              disabled={watchlistLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${watchlistLoading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {watchlistLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : watchlist.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <MediaGrid items={watchlist} showRequestButton={false} />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('no_watchlist_yet')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{user.first_name} {user.last_name}</h1>
        <p className="text-muted-foreground">{t('public_profile')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{t('profile')}</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MailQuestion className="h-4 w-4" />
            <span className="hidden sm:inline">{t('requests')}</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">{t('favorites')}</span>
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">{t('watchlist')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileInfoCard />
            <RequestsCard />
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <RequestsCard />
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <FavoritesCard />
          </div>
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <WatchlistCard />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default UserPublicProfile;