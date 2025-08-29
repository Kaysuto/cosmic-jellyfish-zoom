-- Update get_next_up_episodes to return the next episode after the last watched
-- Logic: for each series the user watched, find the latest playback_progress row
-- and then pick the next jellyfin_episodes with season/episode strictly greater.

DROP FUNCTION IF EXISTS public.get_next_up_episodes(uuid);

CREATE OR REPLACE FUNCTION public.get_next_up_episodes(p_user_id uuid)
RETURNS TABLE (
  id integer,
  title text,
  poster_path text,
  media_type text,
  next_episode_to_watch jsonb
)
LANGUAGE sql
AS $$
  WITH latest AS (
    SELECT DISTINCT ON (pp.tmdb_id)
      pp.tmdb_id,
      pp.media_type,
      NULLIF(pp.season_number, -1) AS season_number,
      NULLIF(pp.episode_number, -1) AS episode_number,
      pp.updated_at
    FROM public.playback_progress pp
    WHERE pp.user_id = p_user_id AND pp.media_type IN ('tv', 'anime')
    ORDER BY pp.tmdb_id, pp.updated_at DESC
  ),
  mapped AS (
    SELECT
      l.tmdb_id,
      l.media_type,
      COALESCE(l.season_number, 0) AS last_season,
      COALESCE(l.episode_number, 0) AS last_episode
    FROM latest l
  ),
  with_series AS (
    SELECT
      m.tmdb_id,
      (SELECT jellyfin_id FROM public.catalog_items ci WHERE ci.tmdb_id = m.tmdb_id AND ci.media_type IN ('tv','anime') LIMIT 1) AS jellyfin_id
    FROM mapped m
  )
  SELECT
    ws.tmdb_id AS id,
    ci.title,
    ci.poster_path,
    ci.media_type,
    (
      SELECT jsonb_build_object(
        'season_number', je.season_number,
        'episode_number', je.episode_number,
        'title', je.title,
        'still_path', je.still_path
      )
      FROM public.jellyfin_episodes je
      WHERE je.jellyfin_id = ws.jellyfin_id
        AND (
          (je.season_number > (SELECT last_season FROM mapped mm WHERE mm.tmdb_id = ws.tmdb_id)) OR
          (
            je.season_number = (SELECT last_season FROM mapped mm WHERE mm.tmdb_id = ws.tmdb_id)
            AND je.episode_number > (SELECT last_episode FROM mapped mm WHERE mm.tmdb_id = ws.tmdb_id)
          )
        )
      ORDER BY je.season_number, je.episode_number
      LIMIT 1
    ) AS next_episode_to_watch
  FROM with_series ws
  JOIN public.catalog_items ci ON ci.tmdb_id = ws.tmdb_id AND ci.media_type IN ('tv','anime');
$$;


