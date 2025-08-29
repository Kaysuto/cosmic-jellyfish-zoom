/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

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
  console.log('Jellyfin login function called with method:', req.method);
  
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: settings, error: settingsError } = await supabaseAdmin
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

    // Vérifier si l'utilisateur existe déjà dans la base de données
    console.log('Checking if user exists in database...');
    console.log('Jellyfin user ID to check:', userData.Id);
    console.log('Jellyfin username:', userData.Name);
    
         // D'abord, vérifier par jellyfin_user_id (si la colonne existe)
     let { data: existingUser, error: userCheckError } = await supabaseAdmin
       .from('profiles')
       .select('id, email')
       .eq('jellyfin_user_id', userData.Id)
       .single();

    console.log('Check by jellyfin_user_id result:', { existingUser, userCheckError });

    // Si pas trouvé par jellyfin_user_id, vérifier par jellyfin_username
    if (!existingUser) {
      console.log('Checking by jellyfin_username:', userData.Name);
      
             const { data: usernameUser, error: usernameError } = await supabaseAdmin
         .from('profiles')
         .select('id, email')
         .eq('jellyfin_username', userData.Name)
         .single();
      
      console.log('Check by jellyfin_username result:', { usernameUser, usernameError });
      
      if (usernameUser) {
        existingUser = usernameUser;
        userCheckError = null;
        console.log('User found by jellyfin_username:', usernameUser.email);
      }
    }

    // Si pas trouvé par jellyfin_username, vérifier par jellyfin_email
    if (!existingUser) {
      const jellyfinEmailToCheck = `${userData.Name}@jellyfin.local`;
      console.log('Checking by jellyfin_email:', jellyfinEmailToCheck);
      
             const { data: jellyfinEmailUser, error: jellyfinEmailError } = await supabaseAdmin
         .from('profiles')
         .select('id, email')
         .eq('jellyfin_email', jellyfinEmailToCheck)
         .single();
      
      console.log('Check by jellyfin_email result:', { jellyfinEmailUser, jellyfinEmailError });
      
      if (jellyfinEmailUser) {
        existingUser = jellyfinEmailUser;
        userCheckError = null;
        console.log('User found by jellyfin_email:', jellyfinEmailUser.email);
      }
    }

    console.log('User check result:', userCheckError ? 'error' : 'success', existingUser ? 'user found' : 'no user');

    let targetEmail = `${userData.Name}@jellyfin.local`;
    let userExists = false;
    let authUserId = null;

         if (existingUser) {
       targetEmail = existingUser.email;
       userExists = true;
       authUserId = existingUser.id;
       console.log('Existing user found:', existingUser.email);
      
      // Essayer de mettre à jour avec les infos Jellyfin (si les colonnes existent)
      try {
        console.log('Updating existing user with jellyfin info...');
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            jellyfin_user_id: userData.Id,
            jellyfin_username: userData.Name,
            is_administrator: userData.Policy.IsAdministrator
          })
          .eq('id', existingUser.id);
        
        if (updateError) {
          console.warn('Failed to update user with jellyfin info (columns might not exist):', updateError);
        } else {
          console.log('User updated with jellyfin info successfully');
        }
      } catch (updateError) {
        console.warn('Error updating user with jellyfin info:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        user: {
          Id: userData.Id,
          Name: userData.Name,
          email: targetEmail,
          IsAdministrator: userData.Policy.IsAdministrator,
          userExists: userExists,
          authUserId: authUserId
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
    console.error('Jellyfin login error:', error)
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
