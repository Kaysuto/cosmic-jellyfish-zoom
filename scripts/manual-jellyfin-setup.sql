-- Configuration manuelle Jellyfin
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

-- 3. Créer la table jellyfin_settings
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

-- 6. Insérer les paramètres Jellyfin
INSERT INTO public.jellyfin_settings (id, url, api_key) 
VALUES (1, 'https://playjelly.fr', '6ad7238735cd431c9384911bcdc3090c') 
ON CONFLICT (id) DO UPDATE SET 
  url = EXCLUDED.url,
  api_key = EXCLUDED.api_key,
  updated_at = NOW();

-- 7. Vérifier la configuration
SELECT 
  'Configuration Jellyfin terminée!' as status,
  url,
  CASE 
    WHEN api_key != '' THEN 'API Key configurée'
    ELSE 'API Key manquante'
  END as api_key_status
FROM public.jellyfin_settings 
WHERE id = 1;
