-- ========================================
-- CORRECTION COMPLÈTE DE LA BASE DE DONNÉES
-- ========================================
-- Date: 2025-01-28
-- Description: Correction automatique des tables et politiques RLS

-- ========================================
-- 1. SUPPRIMER LES TABLES PROBLÉMATIQUES
-- ========================================
DROP TABLE IF EXISTS public.incident_updates CASCADE;
DROP TABLE IF EXISTS public.logs CASCADE;

-- ========================================
-- 2. CRÉER LA TABLE INCIDENT_UPDATES
-- ========================================
CREATE TABLE IF NOT EXISTS public.incident_updates (
  id SERIAL PRIMARY KEY,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 3. CRÉER LA TABLE LOGS
-- ========================================
CREATE TABLE IF NOT EXISTS public.logs (
  id SERIAL PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  service TEXT,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 4. CONFIGURER RLS POUR INCIDENT_UPDATES
-- ========================================
ALTER TABLE public.incident_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to incident_updates" ON public.incident_updates;
CREATE POLICY "Allow public access to incident_updates" ON public.incident_updates
  FOR SELECT USING (true);

-- ========================================
-- 5. CONFIGURER RLS POUR LOGS
-- ========================================
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to logs" ON public.logs;
CREATE POLICY "Allow all access to logs" ON public.logs
  FOR ALL USING (true);

-- ========================================
-- 6. CORRIGER JELLYFIN_SETTINGS
-- ========================================
ALTER TABLE public.jellyfin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage jellyfin settings" ON public.jellyfin_settings;
DROP POLICY IF EXISTS "Allow all access to jellyfin_settings" ON public.jellyfin_settings;
CREATE POLICY "Allow all access to jellyfin_settings" ON public.jellyfin_settings
  FOR ALL USING (true);

INSERT INTO public.jellyfin_settings (id, url, api_key)
VALUES (1, '', '')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 7. CORRIGER SETTINGS
-- ========================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all access to settings" ON public.settings;
CREATE POLICY "Allow all access to settings" ON public.settings
  FOR ALL USING (true);

INSERT INTO public.settings (key, value)
VALUES
  ('allow_new_registrations', 'true'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- ========================================
-- 8. CORRIGER SERVICES
-- ========================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view services" ON public.services;
DROP POLICY IF EXISTS "Allow public access to services" ON public.services;
CREATE POLICY "Allow public access to services" ON public.services
  FOR SELECT USING (true);

INSERT INTO public.services (name, description, status)
VALUES
  ('Application Web', 'Interface utilisateur principale', 'operational'),
  ('API Jellyfin', 'Service de streaming média', 'operational'),
  ('Base de données', 'Stockage des données', 'operational')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 9. CORRIGER INCIDENTS
-- ========================================
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view incidents" ON public.incidents;
DROP POLICY IF EXISTS "Allow public access to incidents" ON public.incidents;
CREATE POLICY "Allow public access to incidents" ON public.incidents
  FOR SELECT USING (true);

-- ========================================
-- 10. VÉRIFICATION FINALE
-- ========================================
SELECT 'Correction terminée avec succès' as status, 
       COUNT(*) as tables_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('jellyfin_settings', 'settings', 'services', 'incidents', 'incident_updates', 'logs');
