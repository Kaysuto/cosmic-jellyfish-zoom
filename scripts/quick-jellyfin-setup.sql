-- Configuration rapide Jellyfin
-- À exécuter dans l'interface SQL de Supabase

-- 1. Ajouter les colonnes Jellyfin à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS jellyfin_user_id TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS jellyfin_username TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_administrator BOOLEAN DEFAULT FALSE;

-- 2. Créer les index
CREATE INDEX IF NOT EXISTS idx_profiles_jellyfin_user_id ON public.profiles(jellyfin_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_jellyfin_username ON public.profiles(jellyfin_username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_administrator ON public.profiles(is_administrator);

-- 3. Créer la table jellyfin_settings si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.jellyfin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  url TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Activer RLS
ALTER TABLE public.jellyfin_settings ENABLE ROW LEVEL SECURITY;

-- 5. Supprimer et recréer la politique RLS
DROP POLICY IF EXISTS "Admins can manage jellyfin settings" ON public.jellyfin_settings;

CREATE POLICY "Admins can manage jellyfin settings" ON public.jellyfin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 6. Insérer un enregistrement par défaut
INSERT INTO public.jellyfin_settings (id, url, api_key) 
VALUES (1, '', '') 
ON CONFLICT (id) DO NOTHING;

-- 7. Vérifier la structure
SELECT 
  'profiles' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('jellyfin_user_id', 'jellyfin_username', 'is_administrator')
ORDER BY column_name;

-- Message de confirmation
SELECT 'Configuration Jellyfin terminée avec succès!' as status;
