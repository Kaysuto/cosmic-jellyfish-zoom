import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface JellyfinStats {
  animations: number;
  anime: number;
  series: number;
  films: number;
}

interface JellyfinServerInfo {
  name: string;
  version: string;
  totalUsers: number;
}

interface JellyfinSettings {
  url: string;
  api_key: string;
}

interface JellyfinUser {
  Id: string;
  Name: string;
  ServerId: string;
  HasPassword: boolean;
  HasConfiguredPassword: boolean;
  HasConfiguredEasyPassword: boolean;
  EnableAutoLogin: boolean;
  LastLoginDate?: string;
  LastActivityDate?: string;
  Configuration: {
    PlayDefaultAudioTrack: boolean;
    SubtitleLanguagePreference: string;
    DisplayMissingEpisodes: boolean;
    GroupedFolders: string[];
    SubtitleMode: string;
    DisplayCollectionsView: boolean;
    EnableLocalPassword: boolean;
    OrderedViews: string[];
    IncludeTrailersInSuggestions: boolean;
    IncludeFavoritesInSuggestions: boolean;
    LatestItemsExcludes: string[];
    MyMediaExcludes: string[];
    HidePlayedInLatest: boolean;
    RememberAudioSelections: boolean;
    RememberSubtitleSelections: boolean;
    EnableNextEpisodeAutoPlay: boolean;
  };
  Policy: {
    IsAdministrator: boolean;
    IsHidden: boolean;
    IsDisabled: boolean;
    MaxParentalRating?: number;
    BlockedTags: string[];
    EnableUserPreferenceAccess: boolean;
    AccessSchedules: any[];
    BlockUnratedItems: string[];
    EnableRemoteControlOfOtherUsers: boolean;
    EnableSharedDeviceControl: boolean;
    EnableRemoteAccess: boolean;
    EnableLiveTvManagement: boolean;
    EnableLiveTvAccess: boolean;
    EnableMediaPlayback: boolean;
    EnableAudioPlaybackTranscoding: boolean;
    EnableVideoPlaybackTranscoding: boolean;
    EnablePlaybackRemuxing: boolean;
    ForceRemoteSourceTranscoding: boolean;
    EnableContentDeletion: boolean;
    EnableContentDownloading: boolean;
    EnableSyncTranscoding: boolean;
    EnableMediaConversion: boolean;
    EnabledDevices: string[];
    EnableAllDevices: boolean;
    EnabledChannels: string[];
    EnableAllChannels: boolean;
    EnabledFolders: string[];
    EnableAllFolders: boolean;
    InvalidLoginAttemptCount: number;
    LoginAttemptsBeforeLockout: number;
    MaxActiveSessions: number;
    EnablePublicSharing: boolean;
    BlockedMediaFolders: string[];
    BlockedChannels: string[];
    RemoteClientBitrateLimit: number;
    AuthenticationProviderId: string;
    PasswordResetProviderId: string;
    SyncPlayAccess: string;
  };
}

export const useJellyfin = () => {
  const [stats, setStats] = useState<JellyfinStats | null>(null);
  const [serverInfo, setServerInfo] = useState<JellyfinServerInfo | null>(null);
  const [settings, setSettings] = useState<JellyfinSettings | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [jellyfinUsers, setJellyfinUsers] = useState<JellyfinUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Charger les paramètres Jellyfin
  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('jellyfin_settings')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucune ligne trouvée - la table existe mais est vide
          console.log('Table jellyfin_settings vide, configuration requise');
          setConnectionStatus('disconnected');
        } else if (error.code === '42P01') {
          // Table n'existe pas
          console.error('Table jellyfin_settings n\'existe pas. Veuillez exécuter le script de migration.');
          setConnectionStatus('disconnected');
        } else {
          console.error('Erreur lors du chargement des paramètres Jellyfin:', error);
          setConnectionStatus('disconnected');
        }
        return;
      }

      if (data) {
        setSettings(data);
        setConnectionStatus('loading');
        
        // Récupérer les vraies données du serveur Jellyfin
        await testConnection();
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Synchroniser avec Jellyfin
  const syncWithJellyfin = async () => {
    if (!settings?.url || !settings?.api_key) {
      showError('Paramètres Jellyfin non configurés');
      return;
    }

    setIsSyncing(true);
    try {
      // Récupérer les détails des bibliothèques
      const librariesResponse = await fetch(`${settings.url}/Library/VirtualFolders`, {
        headers: {
          'X-Emby-Token': settings.api_key,
          'Content-Type': 'application/json'
        }
      });

      if (librariesResponse.ok) {
        const libraries = await librariesResponse.json();
        
        // Analyser les bibliothèques pour déterminer les catégories
        let animations = 0, anime = 0, series = 0, films = 0;
        
        for (const library of libraries) {
          // Normaliser les caractères accentués pour une meilleure détection
          const libraryName = library.Name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
          const libraryId = library.ItemId;
          
          console.log(`Bibliothèque: ${library.Name} - ID: ${libraryId}`);
          
          // Récupérer le nombre d'items pour cette bibliothèque spécifique
          try {
            // Utiliser l'API Items pour compter les éléments
            const itemsResponse = await fetch(`${settings.url}/Items?ParentId=${libraryId}&IncludeItemTypes=Movie,Series&Recursive=true&StartIndex=0&Limit=1`, {
              headers: {
                'X-Emby-Token': settings.api_key,
                'Content-Type': 'application/json'
              }
            });
            
            if (itemsResponse.ok) {
              const itemsData = await itemsResponse.json();
              const itemCount = itemsData.TotalRecordCount || 0;
              
              console.log(`Bibliothèque: ${library.Name} - Items: ${itemCount}`);
              
              // Debug: afficher le nom de la bibliothèque en minuscules pour diagnostiquer
              console.log(`Debug - Nom bibliothèque (lowercase): "${libraryName}"`);
              
              if (libraryName.includes('anime') || libraryName.includes('animés') || libraryName.includes('animes')) {
                console.log(`→ Catégorisé comme ANIME: ${library.Name}`);
                anime += itemCount;
              } else if (libraryName.includes('animation') || libraryName.includes('animé')) {
                console.log(`→ Catégorisé comme ANIMATIONS: ${library.Name}`);
                animations += itemCount;
              } else if (libraryName.includes('série') || libraryName.includes('series') || libraryName.includes('tv')) {
                console.log(`→ Catégorisé comme SERIES: ${library.Name}`);
                series += itemCount;
              } else if (libraryName.includes('film') || libraryName.includes('movie')) {
                console.log(`→ Catégorisé comme FILMS: ${library.Name}`);
                films += itemCount;
              } else if (libraryName.includes('kaï')) {
                console.log(`→ Catégorisé comme ANIMATIONS (Kaï): ${library.Name}`);
                // Kaï semble être une bibliothèque spéciale, on peut l'ajouter aux animations ou créer une nouvelle catégorie
                animations += itemCount;
              } else {
                console.log(`→ NON CATÉGORISÉ: ${library.Name}`);
              }
            }
          } catch (error) {
            console.error(`Erreur pour la bibliothèque ${library.Name}:`, error);
          }
        }
        
        console.log('Statistiques récupérées:', { animations, anime, series, films });
        
        setStats({
          animations,
          anime,
          series,
          films
        });
      } else {
        console.error('Erreur lors de la récupération des bibliothèques:', librariesResponse.status);
        showError('Impossible de récupérer les statistiques des bibliothèques');
        // Utiliser des données par défaut en cas d'erreur
        setStats({
          animations: 0,
          anime: 0,
          series: 0,
          films: 0
        });
      }
      
      setLastSync(new Date().toISOString());
      showSuccess('Synchronisation réussie');
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      showError('Erreur lors de la synchronisation');
      // Utiliser des données par défaut en cas d'erreur
      setStats({
        animations: 0,
        anime: 0,
        series: 0,
        films: 0
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Tester la connexion et récupérer les infos serveur
  const testConnection = async () => {
    if (!settings?.url || !settings?.api_key) {
      setConnectionStatus('disconnected');
      return;
    }

    try {
      // Tester la connexion en récupérant les infos système
      const response = await fetch(`${settings.url}/System/Info`, {
        headers: {
          'X-Emby-Token': settings.api_key,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const systemInfo = await response.json();
        
        // Récupérer le nombre total d'utilisateurs
        const usersResponse = await fetch(`${settings.url}/Users`, {
          headers: {
            'X-Emby-Token': settings.api_key,
            'Content-Type': 'application/json'
          }
        });
        
        let totalUsers = 0;
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          totalUsers = users.length || 0;
        }
        
        setServerInfo({
          name: systemInfo.ServerName || 'Serveur Jellyfin',
          version: systemInfo.Version || 'Version inconnue',
          totalUsers: totalUsers
        });
        setConnectionStatus('connected');
      } else {
        throw new Error('Erreur de connexion au serveur Jellyfin');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setConnectionStatus('disconnected');
      // Utiliser des données par défaut en cas d'erreur
      setServerInfo({
        name: 'Serveur Jellyfin',
        version: 'Version inconnue',
        totalUsers: 0
      });
    }
  };

  // Sauvegarder les paramètres
  const saveSettings = async (newSettings: JellyfinSettings) => {
    try {
      const { error } = await supabase
        .from('jellyfin_settings')
        .upsert({ id: 1, ...newSettings, updated_at: new Date().toISOString() }, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      setSettings(newSettings);
      showSuccess('Paramètres sauvegardés');
      
      // Tester la nouvelle connexion
      await testConnection();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Erreur lors de la sauvegarde des paramètres');
    }
  };

  // Récupérer les utilisateurs Jellyfin
  const fetchJellyfinUsers = async () => {
    if (!settings?.url || !settings?.api_key) {
      console.log('Paramètres Jellyfin non configurés, impossible de récupérer les utilisateurs');
      return;
    }

    // Éviter les appels multiples simultanés
    if (loadingUsers) {
      console.log('Récupération des utilisateurs déjà en cours...');
      return;
    }

    setLoadingUsers(true);
    try {
      const response = await fetch(`${settings.url}/Users`, {
        headers: {
          'X-Emby-Token': settings.api_key,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const users = await response.json();
        setJellyfinUsers(users);
      } else {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      // Ne pas afficher d'erreur toast pour éviter le spam
      // showError('Erreur lors de la récupération des utilisateurs Jellyfin');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Créer un utilisateur Jellyfin
  const createJellyfinUser = async (userData: { name: string; password: string; isAdmin?: boolean }) => {
    if (!settings?.url || !settings?.api_key) {
      throw new Error('Paramètres Jellyfin non configurés');
    }

    const response = await fetch(`${settings.url}/Users/New`, {
      method: 'POST',
      headers: {
        'X-Emby-Token': settings.api_key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Name: userData.name,
        Password: userData.password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.Message || 'Erreur lors de la création de l\'utilisateur Jellyfin');
    }

    const newUser = await response.json();
    
    // Si l'utilisateur doit être admin, mettre à jour ses permissions
    if (userData.isAdmin) {
      await updateJellyfinUserPolicy(newUser.Id, { IsAdministrator: true });
    }

    return newUser;
  };

  // Mettre à jour les permissions d'un utilisateur Jellyfin
  const updateJellyfinUserPolicy = async (userId: string, policy: Partial<JellyfinUser['Policy']>) => {
    if (!settings?.url || !settings?.api_key) {
      throw new Error('Paramètres Jellyfin non configurés');
    }

    const response = await fetch(`${settings.url}/Users/${userId}/Policy`, {
      method: 'POST',
      headers: {
        'X-Emby-Token': settings.api_key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(policy)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.Message || 'Erreur lors de la mise à jour des permissions');
    }

    return await response.json();
  };

  // Supprimer un utilisateur Jellyfin
  const deleteJellyfinUser = async (userId: string) => {
    if (!settings?.url || !settings?.api_key) {
      throw new Error('Paramètres Jellyfin non configurés');
    }

    const response = await fetch(`${settings.url}/Users/${userId}`, {
      method: 'DELETE',
      headers: {
        'X-Emby-Token': settings.api_key,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.Message || 'Erreur lors de la suppression de l\'utilisateur Jellyfin');
    }
  };

  // Synchroniser automatiquement un utilisateur avec Jellyfin
  const syncUserToJellyfin = async (userData: { email: string; role: string; first_name?: string; last_name?: string }) => {
    if (!settings?.url || !settings?.api_key) {
      console.log('Jellyfin non configuré, synchronisation ignorée');
      return;
    }

    try {
      // Vérifier si l'utilisateur existe déjà dans Jellyfin
      const existingUser = jellyfinUsers.find(u => u.Name === userData.email);
      
      if (existingUser) {
        console.log(`Utilisateur ${userData.email} existe déjà dans Jellyfin`);
        return;
      }

      // Générer un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Créer l'utilisateur dans Jellyfin
      await createJellyfinUser({
        name: userData.email,
        password: tempPassword,
        isAdmin: userData.role === 'admin'
      });

      console.log(`Utilisateur ${userData.email} synchronisé avec Jellyfin`);
      
      // Rafraîchir la liste des utilisateurs Jellyfin
      await fetchJellyfinUsers();
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de ${userData.email} avec Jellyfin:`, error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings && connectionStatus === 'loading') {
      testConnection();
    }
  }, [settings]);

  return {
    stats,
    serverInfo,
    settings,
    connectionStatus,
    lastSync,
    loading,
    isSyncing,
    syncWithJellyfin,
    saveSettings,
    testConnection,
    jellyfinUsers,
    loadingUsers,
    fetchJellyfinUsers,
    createJellyfinUser,
    updateJellyfinUserPolicy,
    deleteJellyfinUser,
    syncUserToJellyfin
  };
};
