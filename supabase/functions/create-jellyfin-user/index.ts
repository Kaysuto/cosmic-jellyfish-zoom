import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateJellyfinUserRequest {
  name: string;
  password: string;
  isAdmin?: boolean;
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

class JellyfinClient {
  baseUrl: string;
  apiKey: string;
  accessToken?: string;
  userId?: string;
  useDirectToken: boolean = false;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  async authenticate() {
    try {
      const authResponse = await fetch(`${this.baseUrl}/Users/AuthenticateWithKey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Emby-Authorization': `MediaBrowser ApiKey="${this.apiKey}"`,
        },
      });
      if (!authResponse.ok) throw new Error(`AuthenticateWithKey failed`);
      const authData = await authResponse.json();
      this.accessToken = authData.AccessToken;
      this.userId = authData.User.Id;
    } catch (authErr) {
      const directTokenResponse = await fetch(`${this.baseUrl}/Users`, {
        headers: { 'X-Emby-Token': this.apiKey, 'Content-Type': 'application/json' },
      });
      if (directTokenResponse.ok) {
        this.useDirectToken = true;
        const users = await directTokenResponse.json();
        const adminUser = users.find((u: any) => u.Policy?.IsAdministrator);
        this.userId = adminUser ? adminUser.Id : users[0]?.Id;
        if (!this.userId) throw new Error('Direct token auth succeeded, but could not retrieve a user ID.');
      } else {
        throw new Error('Jellyfin authentication failed for both standard and direct token methods.');
      }
    }
  }

  private async getAuthHeaders() {
    if (this.useDirectToken) {
      return {
        'X-Emby-Token': this.apiKey,
        'Content-Type': 'application/json',
      };
    } else {
      return {
        'X-Emby-Token': this.accessToken,
        'Content-Type': 'application/json',
      };
    }
  }

  async createUser(userData: CreateJellyfinUserRequest): Promise<JellyfinUser> {
    const headers = await this.getAuthHeaders();
    
    const userPayload = {
      Name: userData.name,
      Password: userData.password,
      Policy: {
        IsAdministrator: userData.isAdmin || false,
        IsHidden: false,
        IsDisabled: false,
        EnableRemoteAccess: true,
        EnableLiveTvAccess: true,
        EnableMediaPlayback: true,
        EnableAudioPlaybackTranscoding: true,
        EnableVideoPlaybackTranscoding: true,
        EnablePlaybackRemuxing: true,
        EnableContentDeletion: false,
        EnableContentDownloading: false,
        EnableSyncTranscoding: false,
        EnableMediaConversion: false,
        EnableAllDevices: true,
        EnableAllChannels: true,
        EnableAllFolders: true,
        InvalidLoginAttemptCount: 0,
        LoginAttemptsBeforeLockout: 5,
        MaxActiveSessions: 3,
        EnablePublicSharing: false,
        BlockedTags: [],
        BlockedMediaFolders: [],
        BlockedChannels: [],
        RemoteClientBitrateLimit: 0,
        AuthenticationProviderId: 'Jellyfin.Server.Implementations.Users.DefaultAuthenticationProvider',
        PasswordResetProviderId: 'Jellyfin.Server.Implementations.Users.DefaultPasswordResetProvider',
        SyncPlayAccess: 'CreateAndJoinGroups'
      }
    };

    const response = await fetch(`${this.baseUrl}/Users/New`, {
      method: 'POST',
      headers,
      body: JSON.stringify(userPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.Message || `Failed to create user: ${response.status} ${response.statusText}`);
    }

    const createdUser = await response.json();
    return createdUser;
  }

  async getUserByName(name: string): Promise<JellyfinUser | null> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}/Users`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }

    const users: JellyfinUser[] = await response.json();
    return users.find(user => user.Name === name) || null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer les paramètres Jellyfin
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('jellyfin_settings')
      .select('url, api_key')
      .single();

    if (settingsError) {
      const message = `Failed to fetch Jellyfin settings: ${settingsError.message || settingsError}`;
      return new Response(JSON.stringify({ ok: false, error: message }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      });
    }

    if (!settings || !settings.url || !settings.api_key) {
      const message = 'Jellyfin URL or API key is not configured in settings.';
      return new Response(JSON.stringify({ ok: false, error: message }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      });
    }

    const jellyfin = new JellyfinClient(settings.url, settings.api_key);
    await jellyfin.authenticate();

    const reqBody: CreateJellyfinUserRequest = await req.json().catch(() => ({}));
    
    if (!reqBody.name || !reqBody.password) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Name and password are required' 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await jellyfin.getUserByName(reqBody.name);
    if (existingUser) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: `User with name '${reqBody.name}' already exists`,
        existingUser 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      });
    }

    // Créer l'utilisateur
    const createdUser = await jellyfin.createUser(reqBody);

    return new Response(JSON.stringify({ 
      ok: true, 
      user: createdUser,
      message: `User '${reqBody.name}' created successfully`
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    });

  } catch (error: any) {
    console.error('Error in create-jellyfin-user:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message || 'Internal server error' 
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    });
  }
})
