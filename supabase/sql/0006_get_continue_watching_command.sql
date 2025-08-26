-- Replace function get_continue_watching
DROP FUNCTION IF EXISTS public.get_continue_watching(uuid);

CREATE OR REPLACE FUNCTION public.get_continue_watching(p_user_id uuid)
RETURNS TABLE (
  id integer,
  title text,
  poster_path text,
  media_type text,
  progress numeric,
  playback_position_ticks bigint,
  runtime_ticks bigint,
  season_number integer,
  episode_number integer
)
LANGUAGE sql
AS $$
  SELECT DISTINCT ON (pp.media_type, ci.tmdb_id)
    ci.tmdb_id AS id,
    ci.title AS title,
    ci.poster_path AS poster_path,
    pp.media_type AS media_type,
    CASE WHEN pp.total_seconds > 0 THEN ROUND((pp.progress_seconds::numeric / pp.total_seconds::numeric) * 100, 2) ELSE 0 END AS progress,
    (pp.progress_seconds::numeric * 10000000)::bigint AS playback_position_ticks,
    (pp.total_seconds::numeric * 10000000)::bigint AS runtime_ticks,
    NULLIF(pp.season_number, -1) AS season_number,
    NULLIF(pp.episode_number, -1) AS episode_number
  FROM public.playback_progress pp
  JOIN public.catalog_items ci ON ci.tmdb_id = pp.tmdb_id AND ci.media_type = pp.media_type
  WHERE pp.user_id = p_user_id
  ORDER BY pp.media_type, ci.tmdb_id, pp.updated_at DESC;
$$;