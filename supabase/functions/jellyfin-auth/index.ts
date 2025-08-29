import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { corsHeaders } from '../_shared/cors.ts'

interface JellyfinAuthRequest {
  username: string;
  password: string;
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
    MaxParentalRating: number;
    BlockedTags: string[];
    AllowedTags: string[];
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

serve(async (req) => {
  console.log('Jellyfin auth function called with method:', req.method);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    console.log('Parsing request body...');
    const { username, password }: JellyfinAuthRequest = await req.json()
    console.log('Request body parsed, username:', username ? 'provided' : 'missing');

    if (!username || !password) {
      console.log('Missing username or password');
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    console.log('Fetching Jellyfin settings from Supabase...');
    // Récupérer les paramètres Jellyfin depuis Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: settings, error: settingsError } = await supabaseClient
      .from('jellyfin_settings')
      .select('url, api_key')
      .eq('id', 1)
      .single()

    console.log('Settings fetch result:', settingsError ? 'error' : 'success', settings ? 'settings found' : 'no settings');

    if (settingsError || !settings?.url || !settings?.api_key) {
      console.log('Settings error or missing config:', settingsError?.message);
      return new Response(
        JSON.stringify({ error: 'Jellyfin settings not configured' }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    console.log('Authenticating with Jellyfin at:', settings.url);
    // Authentifier avec Jellyfin
    const authResponse = await fetch(`${settings.url}/Users/AuthenticateByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Emby-Token': settings.api_key,
      },
      body: JSON.stringify({
        Username: username,
        Pw: password
      })
    })

    console.log('Jellyfin auth response status:', authResponse.status);

    if (!authResponse.ok) {
      console.log('Jellyfin authentication failed');
      return new Response(
        JSON.stringify({ error: 'Invalid Jellyfin credentials' }),
        { 
          status: 401,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    console.log('Parsing Jellyfin auth response...');
    const authData = await authResponse.json()
    
    if (!authData.User) {
      console.log('No user data in Jellyfin response');
      return new Response(
        JSON.stringify({ error: 'Jellyfin authentication failed' }),
        { 
          status: 401,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    console.log('Fetching user details for ID:', authData.User.Id);
    // Récupérer les détails complets de l'utilisateur
    const userResponse = await fetch(`${settings.url}/Users/${authData.User.Id}`, {
      headers: {
        'X-Emby-Token': settings.api_key,
      }
    })

    console.log('User details response status:', userResponse.status);

    if (!userResponse.ok) {
      console.log('Failed to fetch user details');
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user details' }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    console.log('Parsing user details...');
    const userData: JellyfinUser = await userResponse.json()

    console.log('Returning successful response for user:', userData.Name);
    return new Response(
      JSON.stringify({ 
        user: {
          Id: userData.Id,
          Name: userData.Name,
          email: `${userData.Name}@jellyfin.local`, // Email généré pour l'app
          IsAdministrator: userData.Policy.IsAdministrator
        }
      }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Jellyfin auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
