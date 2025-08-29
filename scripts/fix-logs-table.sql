-- ========================================
-- CORRECTION DIRECTE DE LA TABLE LOGS
-- ========================================
-- Script à exécuter directement dans Supabase SQL Editor

-- Supprimer la table logs si elle existe déjà
DROP TABLE IF EXISTS public.logs CASCADE;

-- Créer la table logs avec la structure correcte
CREATE TABLE public.logs (
  id SERIAL PRIMARY KEY,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  service TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer des index pour optimiser les performances
CREATE INDEX idx_logs_created_at ON public.logs(created_at DESC);
CREATE INDEX idx_logs_level ON public.logs(level);
CREATE INDEX idx_logs_service ON public.logs(service);

-- Activer RLS
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Allow all access to logs" ON public.logs;
DROP POLICY IF EXISTS "Allow public access to logs" ON public.logs;
DROP POLICY IF EXISTS "Admins can view logs" ON public.logs;
DROP POLICY IF EXISTS "Allow public read access to logs" ON public.logs;
DROP POLICY IF EXISTS "Allow authenticated users to write logs" ON public.logs;

-- Créer une politique qui permet l'accès public en lecture
CREATE POLICY "Allow public read access to logs" ON public.logs
  FOR SELECT USING (true);

-- Créer une politique qui permet l'écriture pour les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to write logs" ON public.logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Insérer quelques logs de test pour vérifier que la table fonctionne
INSERT INTO public.logs (level, message, service, metadata) VALUES
  ('info', 'Table logs créée avec succès', 'database', '{"script": "fix-logs-table.sql"}'),
  ('info', 'Application démarrée', 'application', '{"version": "1.0.0"}'),
  ('info', 'Système de logs initialisé', 'system', '{"component": "logging"}');

-- Vérifier que la table a été créée correctement
SELECT 
  'Table logs créée avec succès' as status,
  COUNT(*) as log_count
FROM public.logs;
