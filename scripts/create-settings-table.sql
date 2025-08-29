-- Création de la table settings manquante
-- À exécuter dans l'interface SQL de Supabase

-- 1. Créer la table settings
CREATE TABLE IF NOT EXISTS public.settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 3. Créer la politique RLS pour les settings
CREATE POLICY "Settings are viewable by everyone" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Settings are manageable by admins" ON public.settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 4. Insérer les paramètres par défaut
INSERT INTO public.settings (key, value, description) VALUES
  ('allow_new_registrations', 'true', 'Autoriser les nouvelles inscriptions'),
  ('require_email_confirmation', 'false', 'Exiger la confirmation email'),
  ('maintenance_mode', 'false', 'Mode maintenance activé'),
  ('site_name', 'Cosmic Jellyfish Zoom', 'Nom du site'),
  ('site_description', 'Plateforme de streaming avec Jellyfin', 'Description du site')
ON CONFLICT (key) DO NOTHING;

-- 5. Vérifier la création
SELECT 
  'Table settings créée avec succès' as status,
  COUNT(*) as settings_count
FROM public.settings;

-- 6. Afficher les paramètres
SELECT key, value, description FROM public.settings ORDER BY key;
