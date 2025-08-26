-- Add title and still_path to jellyfin_episodes if missing
ALTER TABLE IF EXISTS public.jellyfin_episodes
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS still_path TEXT;