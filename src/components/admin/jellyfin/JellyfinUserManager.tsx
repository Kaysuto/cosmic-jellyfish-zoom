import { useState } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useUsers } from '@/hooks/useUsers';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Save,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

interface UserMapping {
  appUserId: string;
  jellyfinUserId: string;
  appUserName: string;
  jellyfinUserName: string;
  status: 'mapped' | 'unmapped' | 'loading';
}

const JellyfinUserManager = () => {
  const { t } = useSafeTranslation();
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jellyfinSearchTerm, setJellyfinSearchTerm] = useState('');
  const [jellyfinCurrentPage, setJellyfinCurrentPage] = useState(1);
  const usersPerPage = 10;
  const jellyfinUsersPerPage = 15;
  
  const { 
    users: jellyfinUsers, 
    loading: jellyfinLoading, 
    connectionStatus 
  } = useJellyfin();
  const { users: appUsers, refreshUsers } = useUsers();

  const handleRefresh = async () => {
    try {
      // Rafraîchir les utilisateurs de l'app
      await refreshUsers();
      
      // Réinitialiser les états locaux
      setMapping({});
      setCurrentPage(1);
      setSearchTerm('');
      setJellyfinSearchTerm('');
      setJellyfinCurrentPage(1);
      
      // Forcer une nouvelle récupération des utilisateurs Jellyfin
      // en rechargeant seulement les données nécessaires
      const { data, error } = await supabase.functions.invoke('jellyfin-proxy', {
        body: { endpoint: 'Users' }
      });
      
      if (error) {
        console.error('Erreur lors du rafraîchissement des utilisateurs Jellyfin:', error);
      }
      
      showSuccess('Données rafraîchies avec succès');
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      showError('Erreur lors du rafraîchissement des données');
    }
  };

  const handleMappingChange = (appUserId: string, jellyfinUserId: string) => {
    setMapping(prev => ({ ...prev, [appUserId]: jellyfinUserId }));
  };

  const handleSaveMapping = async (appUserId: string) => {
    const jellyfinUserId = mapping[appUserId];
    if (!jellyfinUserId) return;

    setLoadingMap(prev => ({ ...prev, [appUserId]: true }));
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ jellyfin_user_id: jellyfinUserId })
        .eq('id', appUserId);

      if (error) throw error;
      showSuccess('Mapping sauvegardé avec succès.');
      refreshUsers();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoadingMap(prev => ({ ...prev, [appUserId]: false }));
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return t('connected');
      case 'disconnected':
        return t('disconnected');
      case 'loading':
        return t('connecting');
      default:
        return t('unknown');
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'disconnected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'loading':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  // Filtrer les utilisateurs selon le terme de recherche
  const filteredAppUsers = appUsers.filter(user => 
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredAppUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedAppUsers = filteredAppUsers.slice(startIndex, endIndex);

  // Filtrer les utilisateurs Jellyfin selon le terme de recherche
  const filteredJellyfinUsers = jellyfinUsers?.filter(user => 
    user.Name.toLowerCase().includes(jellyfinSearchTerm.toLowerCase())
  ) || [];

  // Pagination pour les utilisateurs Jellyfin
  const jellyfinTotalPages = Math.ceil(filteredJellyfinUsers.length / jellyfinUsersPerPage);
  const jellyfinStartIndex = (jellyfinCurrentPage - 1) * jellyfinUsersPerPage;
  const jellyfinEndIndex = jellyfinStartIndex + jellyfinUsersPerPage;
  const paginatedJellyfinUsers = filteredJellyfinUsers.slice(jellyfinStartIndex, jellyfinEndIndex);

  // Créer les mappings utilisateurs (seulement pour les utilisateurs de la page courante)
  const userMappings: UserMapping[] = paginatedAppUsers.map(user => {
    const currentJellyfinUserId = user.jellyfin_user_id || mapping[user.id];
    const jellyfinUser = jellyfinUsers?.find(jf => jf.Id === currentJellyfinUserId);
    
    return {
      appUserId: user.id,
      jellyfinUserId: currentJellyfinUserId || '',
      appUserName: `${user.first_name} ${user.last_name}`.trim(),
      jellyfinUserName: jellyfinUser?.Name || '',
      status: currentJellyfinUserId ? 'mapped' : 'unmapped'
    };
  });

  const mappedCount = userMappings.filter(m => m.status === 'mapped').length;
  const unmappedCount = userMappings.filter(m => m.status === 'unmapped').length;

  // Réinitialiser la page quand on change de recherche
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (connectionStatus === 'disconnected') {
    return (
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">{t('jellyfin_not_connected')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('jellyfin_not_connected_desc')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t('jellyfin_user_management')}</CardTitle>
                <CardDescription>{t('jellyfin_user_management_desc')}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className={`${getConnectionStatusColor()} flex items-center space-x-2`}>
              {getConnectionStatusIcon()}
              <span>{getConnectionStatusText()}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">{appUsers.length}</div>
              <div className="text-sm text-muted-foreground">{t('app_users')}</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{mappedCount}</div>
              <div className="text-sm text-muted-foreground">{t('mapped')}</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">{unmappedCount}</div>
              <div className="text-sm text-muted-foreground">{t('unmapped')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barre de recherche */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('search_users')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('user_mappings')}</CardTitle>
              <CardDescription>{t('user_mappings_desc')}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={jellyfinLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userMappings.map((mapping) => (
              <div
                key={mapping.appUserId}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  mapping.status === 'mapped' 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
                      {mapping.appUserName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{mapping.appUserName}</p>
                      <p className="text-sm text-muted-foreground">
                        {appUsers.find(u => u.id === mapping.appUserId)?.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {mapping.status === 'mapped' ? (
                        <UserCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <UserX className="h-4 w-4 text-yellow-500" />
                      )}
                      <Badge variant="outline" className={mapping.status === 'mapped' ? 'text-green-500 border-green-500/20' : 'text-yellow-500 border-yellow-500/20'}>
                        {mapping.status === 'mapped' ? t('mapped') : t('unmapped')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Select
                        value={mapping.jellyfinUserId}
                        onValueChange={(value) => handleMappingChange(mapping.appUserId, value)}
                        disabled={jellyfinLoading}
                        onOpenChange={(open) => {
                          if (open) {
                            setJellyfinSearchTerm('');
                            setJellyfinCurrentPage(1);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[280px] h-8 text-sm">
                          <SelectValue placeholder={t('select_jellyfin_user')} />
                        </SelectTrigger>
                        <SelectContent className="w-[300px] max-h-[400px]">
                          <div className="p-2 border-b border-border">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder={t('search_jellyfin_users')}
                                value={jellyfinSearchTerm}
                                onChange={(e) => {
                                  setJellyfinSearchTerm(e.target.value);
                                  setJellyfinCurrentPage(1);
                                }}
                                className="pl-8 h-8 text-sm"
                              />
                            </div>
                          </div>
                          
                          <div className="max-h-[300px] overflow-y-auto">
                            {paginatedJellyfinUsers.map(jfUser => (
                              <SelectItem key={jfUser.Id} value={jfUser.Id}>
                                {jfUser.Name}
                              </SelectItem>
                            ))}
                            
                            {paginatedJellyfinUsers.length === 0 && (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                {jellyfinSearchTerm ? t('no_jellyfin_users_found') : t('no_jellyfin_users')}
                              </div>
                            )}
                          </div>
                          
                          {jellyfinTotalPages > 1 && (
                            <div className="p-2 border-t border-border">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  {t('showing')} {jellyfinStartIndex + 1}-{Math.min(jellyfinEndIndex, filteredJellyfinUsers.length)} {t('of')} {filteredJellyfinUsers.length}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setJellyfinCurrentPage(prev => Math.max(1, prev - 1));
                                    }}
                                    disabled={jellyfinCurrentPage === 1}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ChevronLeft className="h-3 w-3" />
                                  </Button>
                                  <span className="text-xs">
                                    {jellyfinCurrentPage}/{jellyfinTotalPages}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setJellyfinCurrentPage(prev => Math.min(jellyfinTotalPages, prev + 1));
                                    }}
                                    disabled={jellyfinCurrentPage === jellyfinTotalPages}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        size="sm"
                        onClick={() => handleSaveMapping(mapping.appUserId)}
                        disabled={!mapping.jellyfinUserId || loadingMap[mapping.appUserId]}
                      >
                        {loadingMap[mapping.appUserId] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {mapping.jellyfinUserName && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      {t('mapped_to')}: <span className="font-medium text-primary">{mapping.jellyfinUserName}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {userMappings.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? t('no_users_found_for_search') : t('no_users_found')}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground">
                  {t('showing')} {startIndex + 1}-{Math.min(endIndex, filteredAppUsers.length)} {t('of')} {filteredAppUsers.length} {t('users')}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t('page')} {currentPage} {t('of')} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JellyfinUserManager;