import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/contexts/AuthContext';
import { useUserListDetails } from '@/hooks/useUserListDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Shield, 
  Mail, 
  Lock, 
  Heart, 
  Bookmark, 
  RefreshCw,
  Calendar,
  Camera,
  Settings
} from 'lucide-react';
import { getGravatarURL } from '@/lib/gravatar';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import MediaGrid from '@/components/catalog/MediaGrid';

// Import des composants existants
import UpdateProfileForm from '@/components/admin/profile/UpdateProfileForm';
import UpdateEmailForm from '@/components/admin/profile/UpdateEmailForm';
import UpdatePasswordForm from '@/components/admin/profile/UpdatePasswordForm';
import MfaManager from '@/components/admin/profile/MfaManager';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { profile, loading: profileLoading } = useProfile();
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  // Hooks pour les listes utilisateur
  const { list: favorites, loading: favoritesLoading, refetch: refetchFavorites } = useUserListDetails(session?.user?.id || '', 'favorite');
  const { list: watchlist, loading: watchlistLoading, refetch: refetchWatchlist } = useUserListDetails(session?.user?.id || '', 'watchlist');

  const LoadingSkeleton = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );

  if (profileLoading || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url || getGravatarURL(profile.email, 160)} />
              <AvatarFallback className="text-3xl">
                {profile.first_name?.charAt(0)}
                {profile.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background"
              title={t('change_avatar')}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{profile.first_name} {profile.last_name}</h1>
            <p className="text-muted-foreground text-lg">{profile.email}</p>
            <Badge variant="secondary" className="mt-2">
              <Calendar className="h-3 w-3 mr-1" />
              {t('member_since')} {format(new Date(profile.updated_at), 'MMMM yyyy', { locale: currentLocale })}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('overview')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('settings')}
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            {t('favorites')}
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            {t('watchlist')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('profile_information')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('first_name')}</label>
                    <p className="text-sm">{profile.first_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('last_name')}</label>
                    <p className="text-sm">{profile.last_name || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('email')}</label>
                  <p className="text-sm">{profile.email}</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('account_created')}</span>
                  <span className="text-sm">{format(new Date(profile.updated_at), 'PPP', { locale: currentLocale })}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('quick_stats')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <div className="text-2xl font-bold">{favorites.length}</div>
                    <div className="text-sm text-muted-foreground">{t('favorites')}</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Bookmark className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{watchlist.length}</div>
                    <div className="text-sm text-muted-foreground">{t('watchlist')}</div>
                  </div>
                </div>
                <Separator />
                <div className="text-center">
                  <Button variant="outline" onClick={() => setActiveTab('settings')}>
                    {t('manage_account')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('personal_information')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpdateProfileForm profile={profile} />
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t('security')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <MfaManager />
              </CardContent>
            </Card>

            {/* Email Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {t('email_settings')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpdateEmailForm profile={profile} />
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {t('password_settings')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpdatePasswordForm />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  <CardTitle>{t('favorites')}</CardTitle>
                  <Badge variant="secondary">{favorites.length}</Badge>
                </div>
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
              </div>
            </CardHeader>
            <CardContent>
              {favoritesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : favorites.length > 0 ? (
                <MediaGrid items={favorites} showRequestButton={false} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{t('no_favorites_yet')}</p>
                  <p className="text-sm">{t('start_adding_favorites')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  <CardTitle>{t('watchlist')}</CardTitle>
                  <Badge variant="secondary">{watchlist.length}</Badge>
                </div>
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
              </div>
            </CardHeader>
            <CardContent>
              {watchlistLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : watchlist.length > 0 ? (
                <MediaGrid items={watchlist} showRequestButton={false} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Bookmark className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{t('no_watchlist_yet')}</p>
                  <p className="text-sm">{t('start_adding_watchlist')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Profile;