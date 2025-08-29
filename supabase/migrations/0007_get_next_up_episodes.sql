-- Drop existing function then create RPC get_next_up_episodes
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
  WITH last_watched AS (
    SELECT
      tmdb_id,
      MAX(updated_at) as last_watched_at
    FROM public.playback_progress
    WHERE user_id = p_user_id AND media_type IN ('tv', 'anime')
    GROUP BY tmdb_id
  ),
  next_up AS (
    SELECT
      lw.tmdb_id,
      (SELECT jellyfin_id FROM public.catalog_items ci WHERE ci.tmdb_id = lw.tmdb_id AND ci.media_type IN ('tv', 'anime') LIMIT 1) as jellyfin_id
    FROM last_watched lw
  )
  SELECT
    nu.tmdb_id as id,
    ci.title as title,
    ci.poster_path as poster_path,
    ci.media_type as media_type,
    (
      SELECT jsonb_build_object(
        'season_number', je.season_number,
        'episode_number', je.episode_number,
        'title', je.title,
        'still_path', je.still_path
      )
      FROM public.jellyfin_episodes je
      WHERE je.jellyfin_id = nu.jellyfin_id
      ORDER BY je.season_number, je.episode_number
      LIMIT 1
    ) as next_episode_to_watch
  FROM next_up nu
  JOIN public.catalog_items ci ON ci.tmdb_id = nu.tmdb_id
  WHERE ci.media_type IN ('tv', 'anime');
$$;