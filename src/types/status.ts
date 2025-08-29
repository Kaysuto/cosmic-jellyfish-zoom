import { Service } from "@/types/supabase";

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export interface IncidentUpdate {
  id: number;
  incident_id: number;
  status: IncidentStatus;
  message: string;
  created_at: string;
}

export interface Incident {
  id: number;
  title: string;
  description?: string;
  title_en?: string;
  description_en?: string;
  status: IncidentStatus;
  created_at: string;
  service_id: number | null;
  service: Service | null;
  incident_updates: IncidentUpdate[];
  author_id?: string | null;
}