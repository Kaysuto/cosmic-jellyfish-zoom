import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useJellyfin } from '@/contexts/JellyfinContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

const JellyfinUserManager = () => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const { 
    users: jellyfinUsers, 
    loading: jellyfinLoading, 
    connectionStatus 
  } = useJellyfin();
  const { users, refreshUsers } = useUsers();

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

  const renderConnectionStatus = () => {
    if (connectionStatus === 'loading') {
      return <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement...</div>;
    }
    if (connectionStatus === 'disconnected') {
      return <div className="flex items-center text-red-500"><XCircle className="mr-2 h-4 w-4" /> Déconnecté</div>;
    }
    return <div className="flex items-center text-green-500"><CheckCircle className="mr-2 h-4 w-4" /> Connecté</div>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Mapping des Utilisateurs Jellyfin</CardTitle>
            <CardDescription>Associez les utilisateurs de l'application aux utilisateurs de Jellyfin.</CardDescription>
          </div>
          {renderConnectionStatus()}
        </div>
      </CardHeader>
      <CardContent>
        {connectionStatus === 'disconnected' && (
          <div className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
            <div>
              Impossible de charger les utilisateurs Jellyfin. Vérifiez vos paramètres de connexion.
            </div>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur de l'application</TableHead>
              <TableHead>Utilisateur Jellyfin</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.first_name} {user.last_name}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={user.jellyfin_user_id || ''}
                    onValueChange={(value) => handleMappingChange(user.id, value)}
                    disabled={jellyfinLoading || connectionStatus === 'disconnected'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur Jellyfin" />
                    </SelectTrigger>
                    <SelectContent>
                      {jellyfinUsers?.map(jfUser => (
                        <SelectItem key={jfUser.Id} value={jfUser.Id}>
                          {jfUser.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => handleSaveMapping(user.id)}
                    disabled={!mapping[user.id] || loadingMap[user.id]}
                  >
                    {loadingMap[user.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sauvegarder
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default JellyfinUserManager;