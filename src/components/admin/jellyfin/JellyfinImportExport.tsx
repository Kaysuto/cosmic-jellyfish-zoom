import { useState, useMemo } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Upload, 
  Users, 
  UserPlus, 
  UserCheck, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  FileText,
  Database,
  Search
} from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface UserMapping {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ready' | 'exists' | 'error';
  selected: boolean;
}

const JellyfinImportExport = () => {
  const { t } = useSafeTranslation();
  const { users: jellyfinUsers, connectionStatus, loading: jellyfinLoading } = useJellyfin();
  const { users: appUsers, refreshUsers } = useUsers();
  const [selectedAppUsers, setSelectedAppUsers] = useState<Set<string>>(new Set());
  const [selectedJellyfinUsers, setSelectedJellyfinUsers] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [appUsersSearchTerm, setAppUsersSearchTerm] = useState('');
  const [jellyfinUsersSearchTerm, setJellyfinUsersSearchTerm] = useState('');

  // Utilisateurs de l'app prêts à être importés vers Jellyfin
  const appUsersForImport = useMemo(() => {
    if (!appUsers || !jellyfinUsers) return [];
    
    let filteredUsers = appUsers.map(user => {
      const existsInJellyfin = jellyfinUsers.some(jfUser => 
        jfUser.Name === user.email || jfUser.Name === `${user.first_name} ${user.last_name}`.trim()
      );
      
      return {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        role: user.role || 'user',
        status: existsInJellyfin ? 'exists' : 'ready',
        selected: selectedAppUsers.has(user.id)
      };
    });

    // Filtrer par terme de recherche
    if (appUsersSearchTerm) {
      const searchLower = appUsersSearchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    return filteredUsers;
  }, [appUsers, jellyfinUsers, selectedAppUsers, appUsersSearchTerm]);

  // Utilisateurs Jellyfin prêts à être exportés vers l'app
  const jellyfinUsersForExport = useMemo(() => {
    if (!jellyfinUsers || !appUsers) return [];
    
    let filteredUsers = jellyfinUsers.map(jfUser => {
      // Vérifier si l'utilisateur existe déjà par email ou par jellyfin_user_id
      const existsInApp = appUsers.some(appUser => 
        appUser.email === jfUser.Name || 
        `${appUser.first_name} ${appUser.last_name}`.trim() === jfUser.Name ||
        appUser.jellyfin_user_id === jfUser.Id
      );
      
      return {
        id: jfUser.Id,
        name: jfUser.Name,
        email: jfUser.Name, // Jellyfin utilise le nom comme identifiant
        role: 'user', // Par défaut
        status: existsInApp ? 'exists' : 'ready',
        selected: selectedJellyfinUsers.has(jfUser.Id)
      };
    });

    // Filtrer par terme de recherche
    if (jellyfinUsersSearchTerm) {
      const searchLower = jellyfinUsersSearchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    return filteredUsers;
  }, [jellyfinUsers, appUsers, selectedJellyfinUsers, jellyfinUsersSearchTerm]);

  const handleAppUserSelection = (userId: string, selected: boolean) => {
    const newSelection = new Set(selectedAppUsers);
    if (selected) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    setSelectedAppUsers(newSelection);
  };

  const handleJellyfinUserSelection = (userId: string, selected: boolean) => {
    const newSelection = new Set(selectedJellyfinUsers);
    if (selected) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    setSelectedJellyfinUsers(newSelection);
  };

  const selectAllAppUsers = () => {
    const readyUsers = appUsersForImport.filter(user => user.status === 'ready');
    setSelectedAppUsers(new Set(readyUsers.map(user => user.id)));
  };

  const clearAppUserSelection = () => {
    setSelectedAppUsers(new Set());
  };

  const selectAllJellyfinUsers = () => {
    const readyUsers = jellyfinUsersForExport.filter(user => user.status === 'ready');
    setSelectedJellyfinUsers(new Set(readyUsers.map(user => user.id)));
  };

  const clearJellyfinUserSelection = () => {
    setSelectedJellyfinUsers(new Set());
  };

  const importUsersToJellyfin = async () => {
    if (selectedAppUsers.size === 0) return;
    
    setImporting(true);
    try {
      const usersToImport = appUsersForImport.filter(user => selectedAppUsers.has(user.id));
      
      for (const user of usersToImport) {
        try {
          // Appeler la fonction Edge pour créer l'utilisateur Jellyfin
          const { data, error } = await supabase.functions.invoke('create-jellyfin-user', {
            body: {
              name: user.email,
              password: Math.random().toString(36).slice(-8), // Mot de passe temporaire
              isAdmin: user.role === 'admin'
            }
          });

          if (error) throw error;
          
          // Mettre à jour le profil utilisateur avec l'ID Jellyfin
          if (data?.Id) {
            await supabase
              .from('profiles')
              .update({ jellyfin_user_id: data.Id })
              .eq('id', user.id);
          }
        } catch (error: any) {
          console.error(`Erreur lors de l'import de ${user.name}:`, error);
          showError(`Erreur lors de l'import de ${user.name}: ${error.message}`);
        }
      }
      
      showSuccess(`${usersToImport.length} utilisateur(s) importé(s) avec succès vers Jellyfin`);
      setSelectedAppUsers(new Set());
      refreshUsers();
    } catch (error: any) {
      showError(`Erreur lors de l'import: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const exportUsersFromJellyfin = async () => {
    if (selectedJellyfinUsers.size === 0) return;
    
    setExporting(true);
    try {
      const usersToExport = jellyfinUsersForExport.filter(user => selectedJellyfinUsers.has(user.id));
      
      for (const user of usersToExport) {
        try {
          // Appeler la fonction Edge pour créer le compte utilisateur
          const { data, error } = await supabase.functions.invoke('import-jellyfin-users', {
            body: {
              jellyfin_user_id: user.id,
              jellyfin_username: user.name,
              jellyfin_name: user.name,
              password: Math.random().toString(36).slice(-8) + '!1' // Mot de passe temporaire sécurisé
            }
          });

          if (error) throw error;
          if (data.error) throw new Error(data.error);
          
          console.log(`Utilisateur ${user.name} exporté avec succès`);
        } catch (error: any) {
          console.error(`Erreur lors de l'export de ${user.name}:`, error);
          showError(`Erreur lors de l'export de ${user.name}: ${error.message}`);
        }
      }
      
      showSuccess(`${usersToExport.length} utilisateur(s) exporté(s) avec succès vers l'application`);
      setSelectedJellyfinUsers(new Set());
      refreshUsers();
    } catch (error: any) {
      showError(`Erreur lors de l'export: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'exists':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return t('ready_to_import');
      case 'exists':
        return t('already_exists');
      case 'error':
        return t('error');
      default:
        return t('unknown');
    }
  };

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
      {/* Import vers Jellyfin */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Upload className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t('import_to_jellyfin')}</CardTitle>
                <CardDescription>{t('import_to_jellyfin_desc')}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllAppUsers}
                disabled={jellyfinLoading}
              >
                {t('select_all')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAppUserSelection}
                disabled={jellyfinLoading}
              >
                {t('clear_selection')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de recherche pour les utilisateurs de l'app */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search_app_users')}
              value={appUsersSearchTerm}
              onChange={(e) => setAppUsersSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('app_users')} ({appUsersForImport.length})</span>
            <span>{selectedAppUsers.size} {t('selected')}</span>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {appUsersForImport.map(user => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  user.selected ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={user.selected}
                    onCheckedChange={(checked) => handleAppUserSelection(user.id, checked as boolean)}
                    disabled={user.status === 'exists' || jellyfinLoading}
                  />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs">
                    {getStatusIcon(user.status)}
                    <span>{getStatusText(user.status)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">{t('import_selected')}</span>
            </div>
            <Button
              onClick={importUsersToJellyfin}
              disabled={selectedAppUsers.size === 0 || importing || jellyfinLoading}
            >
              {importing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              <UserPlus className="mr-2 h-4 w-4" />
              {t('import_selected')}
            </Button>
          </div>
        </CardContent>
      </Card>

             {/* Export depuis Jellyfin */}
       <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
         <CardHeader>
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <Download className="h-5 w-5 text-primary" />
               <div>
                 <CardTitle>{t('export_from_jellyfin')}</CardTitle>
                                 <CardDescription>
                  {t('export_from_jellyfin_desc')}
                </CardDescription>
               </div>
             </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllJellyfinUsers}
                disabled={jellyfinLoading}
              >
                {t('select_all')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearJellyfinUserSelection}
                disabled={jellyfinLoading}
              >
                {t('clear_selection')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de recherche pour les utilisateurs Jellyfin */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search_jellyfin_users')}
              value={jellyfinUsersSearchTerm}
              onChange={(e) => setJellyfinUsersSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('jellyfin_users')} ({jellyfinUsersForExport.length})</span>
            <span>{selectedJellyfinUsers.size} {t('selected')}</span>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {jellyfinUsersForExport.map(user => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  user.selected ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={user.selected}
                    onCheckedChange={(checked) => handleJellyfinUserSelection(user.id, checked as boolean)}
                    disabled={user.status === 'exists' || jellyfinLoading}
                  />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs">
                    {getStatusIcon(user.status)}
                    <span>{getStatusText(user.status)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">{t('export_selected')}</span>
            </div>
            <Button
              onClick={exportUsersFromJellyfin}
              disabled={selectedJellyfinUsers.size === 0 || exporting || jellyfinLoading}
            >
              {exporting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              <UserPlus className="mr-2 h-4 w-4" />
              {t('export_selected')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JellyfinImportExport;
