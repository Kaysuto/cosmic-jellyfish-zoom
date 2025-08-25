import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserById } from '@/hooks/useUserById';
import { useRequestsByUserId } from '@/hooks/useRequestsByUserId';
import { useUserListDetails } from '@/hooks/useUserListDetails';
import MediaGrid, { MediaItem } from '@/components/catalog/MediaGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGravatarURL } from '@/lib/gravatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Film, Tv, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const UserPublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { t, i18n } = useTranslation();
  const { user, loading: userLoading } = useUserById(userId);
  const { requests, loading: requestsLoading } = useRequestsByUserId(userId);
  const { list: favorites, loading: favoritesLoading } = useUserListDetails(userId || '', 'favorite');
  const { list: watchlist, loading: watchlistLoading } = useUserListDetails(userId || '', 'watchlist');
  const { session } = useSession();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;
  const isOwner = session?.user?.id === userId;

  const statusConfig = {
    pending: { text: t('status_pending'), className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    approved: { text: t('status_approved'), className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    rejected: { text: t('status_rejected'), className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    available: { text: t('status_available'), className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  };

  if (userLoading || requestsLoading || favoritesLoading || watchlistLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8 text-center">{t('user_not_found')}</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
          <AvatarImage src={user.avatar_url || getGravatarURL(user.email, 160)} />
          <AvatarFallback className="text-4xl">
            {user.first_name?.charAt(0)}
            {user.last_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold">{user.first_name} {user.last_name}</h1>
          <p className="text-muted-foreground">{t('member_since')} {format(new Date(user.updated_at), 'MMMM yyyy', { locale: currentLocale })}</p>
          {isOwner && (
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to={`/users/${userId}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                {t('edit_profile')}
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">{t('media_requests')}</TabsTrigger>
          <TabsTrigger value="favorites">{t('favorites')}</TabsTrigger>
          <TabsTrigger value="watchlist">{t('watchlist')}</TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>{t('media_requests')}</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {requests.map((request) => (
                    <Link to={`/media/${request.media_type}/${request.tmdb_id}`} key={request.id}>
                      <Card className="overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1">
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
                          <p className="text-xs text-muted-foreground">{format(new Date(request.requested_at), 'd MMM yyyy', { locale: currentLocale })}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">{t('no_requests_yet')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>{t('favorites')}</CardTitle>
            </CardHeader>
            <CardContent>
              {favoritesLoading ? (
                <p>Loading...</p>
              ) : favorites.length > 0 ? (
                <MediaGrid items={favorites} />
              ) : (
                <p className="text-muted-foreground text-center py-8">{t('no_favorites_yet')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="watchlist">
          <Card>
            <CardHeader>
              <CardTitle>{t('watchlist')}</CardTitle>
            </CardHeader>
            <CardContent>
              {watchlistLoading ? (
                <p>Loading...</p>
              ) : watchlist.length > 0 ? (
                <MediaGrid items={watchlist} />
              ) : (
                <p className="text-muted-foreground text-center py-8">{t('no_watchlist_yet')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default UserPublicProfile;