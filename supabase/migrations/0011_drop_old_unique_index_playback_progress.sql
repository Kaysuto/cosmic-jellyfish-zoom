-- Migration: drop obsolete unique index causing 409 conflicts on upsert
-- Context: Frontend upsert uses ON CONFLICT (user_id, tmdb_id, media_type, season_number, episode_number)
-- Problem: A legacy unique constraint/index `playback_progress_user_media_idx` on (user_id, tmdb_id, media_type)
--          still exists and causes duplicate key violations when inserting per-episode rows.
-- Solution: Drop the legacy unique constraint/index if it exists. Keep the composite primary key
--           on (user_id, tmdb_id, media_type, season_number, episode_number) as defined in 0010.

DO $$
BEGIN
  -- Drop legacy constraint if it was created as a constraint
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.playback_progress'::regclass
      AND conname = 'playback_progress_user_media_idx'
  ) THEN
    ALTER TABLE public.playback_progress DROP CONSTRAINT playback_progress_user_media_idx;
  END IF;

  -- Drop legacy index if it was created as an index (most common case)
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'playback_progress_user_media_idx'
      AND n.nspname = 'public'
  ) THEN
    DROP INDEX public.playback_progress_user_media_idx;
  END IF;
END
$$;

-- Safety check: ensure the expected primary key exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.playback_progress'::regclass
      AND contype = 'p'
      AND conname = 'playback_progress_pkey'
  ) THEN
    ALTER TABLE public.playback_progress
      ADD CONSTRAINT playback_progress_pkey
      PRIMARY KEY (user_id, tmdb_id, media_type, season_number, episode_number);
  END IF;
END
$$;


