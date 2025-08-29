-- ========================================
-- CORRECTION DE LA TABLE LOGS
-- ========================================
-- Date: 2025-01-28
-- Description: Création de la table logs manquante

-- Supprimer la table logs si elle existe déjà (pour éviter les conflits)
DROP TABLE IF EXISTS public.logs CASCADE;

-- Créer la table logs avec la structure correcte
CREATE TABLE IF NOT EXISTS public.logs (
  id SERIAL PRIMARY KEY,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  service TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer un index sur created_at pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level ON public.logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_service ON public.logs(service);

-- Activer RLS
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Allow all access to logs" ON public.logs;
DROP POLICY IF EXISTS "Allow public access to logs" ON public.logs;
DROP POLICY IF EXISTS "Admins can view logs" ON public.logs;

-- Créer une politique qui permet l'accès public en lecture
CREATE POLICY "Allow public read access to logs" ON public.logs
  FOR SELECT USING (true);

-- Créer une politique qui permet l'écriture pour les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to write logs" ON public.logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Insérer quelques logs de test pour vérifier que la table fonctionne
INSERT INTO public.logs (level, message, service, metadata) VALUES
  ('info', 'Table logs créée avec succès', 'database', '{"migration": "20250128000007_fix_logs_table.sql"}'),
  ('info', 'Application démarrée', 'application', '{"version": "1.0.0"}'),
  ('info', 'Système de logs initialisé', 'system', '{"component": "logging"}')
ON CONFLICT DO NOTHING;
