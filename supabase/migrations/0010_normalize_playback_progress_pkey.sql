-- Migration: normalize playback_progress keys to support ON CONFLICT with season/episode
-- Strategy:
-- 1) Ensure season_number and episode_number columns exist
-- 2) Normalize existing NULLs to -1 (sentinel)
-- 3) Set DEFAULT -1 and NOT NULL so uniqueness works predictably
-- 4) Replace existing primary key / unique constraint with a composite PK including season_number and episode_number
-- Note: After running this, PostgREST / Supabase schema cache may need to be refreshed.

BEGIN;

-- 1) Add columns if missing (nullable for now)
ALTER TABLE IF EXISTS public.playback_progress
  ADD COLUMN IF NOT EXISTS season_number integer,
  ADD COLUMN IF NOT EXISTS episode_number integer;

-- 2) Normalize existing NULLs to sentinel -1
UPDATE public.playback_progress SET season_number = -1 WHERE season_number IS NULL;
UPDATE public.playback_progress SET episode_number = -1 WHERE episode_number IS NULL;

-- 3) Set sensible defaults and NOT NULL constraints so ON CONFLICT columns always exist
ALTER TABLE public.playback_progress ALTER COLUMN season_number SET DEFAULT -1;
ALTER TABLE public.playback_progress ALTER COLUMN episode_number SET DEFAULT -1;
ALTER TABLE public.playback_progress ALTER COLUMN season_number SET NOT NULL;
ALTER TABLE public.playback_progress ALTER COLUMN episode_number SET NOT NULL;

-- 4) Remove existing constraint (if present) and create a composite primary key that matches ON CONFLICT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.playback_progress'::regclass
      AND conname = 'playback_progress_pkey'
  ) THEN
    ALTER TABLE public.playback_progress DROP CONSTRAINT playback_progress_pkey;
  END IF;
END
$$;

ALTER TABLE public.playback_progress
  ADD CONSTRAINT playback_progress_pkey
  PRIMARY KEY (user_id, tmdb_id, media_type, season_number, episode_number);

COMMIT;