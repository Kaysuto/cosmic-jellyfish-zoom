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
  episode_number integer,
  vote_average numeric,
  release_date date,
  name text
)
LANGUAGE sql
AS $$
  SELECT DISTINCT ON (pp.media_type, ci.tmdb_id)
    ci.tmdb_id AS id,
    ci.title AS title,
    -- Pour les épisodes, utiliser l'image de l'épisode si disponible, sinon l'image de la série
    CASE 
      WHEN pp.media_type IN ('tv', 'anime') AND pp.season_number > 0 AND pp.episode_number > 0 
      THEN COALESCE(je.still_path, ci.poster_path)
      ELSE ci.poster_path
    END AS poster_path,
    pp.media_type AS media_type,
    CASE WHEN pp.total_seconds > 0 THEN ROUND((pp.progress_seconds::numeric / pp.total_seconds::numeric) * 100, 2) ELSE 0 END AS progress,
    (pp.progress_seconds::numeric * 10000000)::bigint AS playback_position_ticks,
    (pp.total_seconds::numeric * 10000000)::bigint AS runtime_ticks,
    NULLIF(pp.season_number, -1) AS season_number,
    NULLIF(pp.episode_number, -1) AS episode_number,
    COALESCE(ci.vote_average, 0) AS vote_average,
    COALESCE(ci.release_date, '') AS release_date,
    ci.title AS name
  FROM public.playback_progress pp
  JOIN public.catalog_items ci ON ci.tmdb_id = pp.tmdb_id AND ci.media_type = pp.media_type
  LEFT JOIN public.jellyfin_episodes je ON je.series_jellyfin_id = ci.jellyfin_id 
    AND je.season_number = pp.season_number 
    AND je.episode_number = pp.episode_number
  WHERE pp.user_id = p_user_id
  ORDER BY pp.media_type, ci.tmdb_id, pp.updated_at DESC;
$$;