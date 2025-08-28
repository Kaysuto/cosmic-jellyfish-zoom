-- Script pour créer la table jellyfin_settings
-- À exécuter dans l'éditeur SQL de Supabase

-- Create Jellyfin Settings Table
CREATE TABLE IF NOT EXISTS public.jellyfin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.jellyfin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read and write jellyfin settings
CREATE POLICY "Admins can manage jellyfin settings" ON public.jellyfin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert default record
INSERT INTO public.jellyfin_settings (id, url, api_key) 
VALUES (1, '', '') 
ON CONFLICT (id) DO NOTHING;

-- Vérification
SELECT * FROM public.jellyfin_settings;
