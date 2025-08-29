-- Script pour appliquer les migrations Jellyfin manuellement
-- À exécuter dans l'interface SQL de Supabase

-- 1. Ajouter les colonnes Jellyfin à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS jellyfin_user_id TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS jellyfin_username TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_administrator BOOLEAN DEFAULT FALSE;

-- 2. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_jellyfin_user_id
ON public.profiles(jellyfin_user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_jellyfin_username
ON public.profiles(jellyfin_username);

CREATE INDEX IF NOT EXISTS idx_profiles_is_administrator
ON public.profiles(is_administrator);

-- 3. Créer un index unique sur jellyfin_user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_jellyfin_user_id_unique
ON public.profiles(jellyfin_user_id)
WHERE jellyfin_user_id IS NOT NULL;

-- 4. Vérifier que la table jellyfin_settings existe
CREATE TABLE IF NOT EXISTS public.jellyfin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Ajouter RLS à jellyfin_settings si pas déjà fait
ALTER TABLE public.jellyfin_settings ENABLE ROW LEVEL SECURITY;

-- 6. Supprimer la politique existante si elle existe
DROP POLICY IF EXISTS "Admins can manage jellyfin settings" ON public.jellyfin_settings;

-- 7. Recréer la politique RLS
CREATE POLICY "Admins can manage jellyfin settings" ON public.jellyfin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 8. Insérer un enregistrement par défaut
INSERT INTO public.jellyfin_settings (id, url, api_key) 
VALUES (1, '', '') 
ON CONFLICT (id) DO NOTHING;

-- Message de confirmation
SELECT 'Migrations Jellyfin appliquées avec succès' as status;
