-- Migration: add season_number and episode_number to playback_progress (idempotent)
-- Ajoute les colonnes season_number et episode_number si elles n'existent pas déjà.
-- Note: après l'exécution, si vous utilisez PostgREST/Supabase REST, pensez à redémarrer le service ou à invalider le cache du schéma si nécessaire.

BEGIN;

-- Add nullable season and episode columns if missing
ALTER TABLE IF EXISTS public.playback_progress
  ADD COLUMN IF NOT EXISTS season_number integer,
  ADD COLUMN IF NOT EXISTS episode_number integer;

COMMIT;