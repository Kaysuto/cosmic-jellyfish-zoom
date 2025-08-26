-- First, drop the existing primary key if it exists
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

-- Add a new composite primary key
-- This ensures uniqueness and serves as the index for upserts.
-- Using COALESCE to handle NULLs in season_number and episode_number for the index.
-- We'll use a sentinel value like -1 for NULLs in the unique index.
ALTER TABLE public.playback_progress
ADD CONSTRAINT playback_progress_pkey
PRIMARY KEY (user_id, tmdb_id, media_type, 
             COALESCE(season_number, -1), COALESCE(episode_number, -1));