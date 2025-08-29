export interface Profile {
  id: string;
  updated_at: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string | null;
  email?: string | null;
  jellyfin_user_id?: string | null;
  jellyfin_username?: string | null;
  is_administrator?: boolean | null;
  has_mfa?: boolean | null;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  status: 'operational' | 'degraded' | 'downtime' | 'maintenance';
  created_at: string;
  url_to_check: string | null;
}

export interface Log {
  id: number;
  created_at: string;
  user_id: string | null;
  action: string;
  details: Record<string, any> | null;
}

// ========================================
// NOUVELLES INTERFACES POUR LES TABLES RESTAURÉES
// ========================================

export interface CatalogItem {
  id: number;
  tmdb_id: number;
  jellyfin_id: string | null;
  media_type: 'movie' | 'tv' | 'anime';
  title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  vote_average: number | null;
  vote_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface MediaRequest {
  id: number;
  user_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv' | 'anime';
  title: string;
  overview: string | null;
  poster_path: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes: string | null;
  updated_at: string;
}

export interface AppSetting {
  id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface JellyfinSetting {
  id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// TYPES POUR LES RÉPONSES DE BASE DE DONNÉES
// ========================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id'> & { id?: string };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, 'id' | 'created_at'>;
        Update: Partial<Omit<Service, 'id' | 'created_at'>>;
      };
      logs: {
        Row: Log;
        Insert: Omit<Log, 'id' | 'created_at'>;
        Update: Partial<Omit<Log, 'id' | 'created_at'>>;
      };
      catalog_items: {
        Row: CatalogItem;
        Insert: Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      media_requests: {
        Row: MediaRequest;
        Insert: Omit<MediaRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MediaRequest, 'id' | 'created_at' | 'updated_at'>>;
      };
      app_settings: {
        Row: AppSetting;
        Insert: Omit<AppSetting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AppSetting, 'id' | 'created_at' | 'updated_at'>>;
      };
      jellyfin_settings: {
        Row: JellyfinSetting;
        Insert: Omit<JellyfinSetting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<JellyfinSetting, 'id' | 'created_at' | 'updated_at'>>;
      };
      settings: {
        Row: AppSetting; // Alias pour app_settings
        Insert: Omit<AppSetting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AppSetting, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};