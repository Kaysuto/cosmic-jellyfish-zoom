export interface Profile {
  id: string;
  updated_at: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string | null;
  jellyfin_user_id?: string | null;
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