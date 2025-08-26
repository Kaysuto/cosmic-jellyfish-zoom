-- Fix notification title duplication by removing "Nouvelle demande:" prefix from trigger
CREATE OR REPLACE FUNCTION public.fn_notify_on_media_request()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  INSERT INTO public.notifications (type, title, payload, target_role, is_read, created_at)
  VALUES (
    'media_request',
    COALESCE(NEW.title, NEW.tmdb_id::text),
    jsonb_build_object(
      'request_id', NEW.id,
      'tmdb_id', NEW.tmdb_id,
      'media_type', NEW.media_type,
      'user_id', NEW.user_id,
      'requested_at', COALESCE(NEW.requested_at, NOW()),
      'poster_path', NEW.poster_path
    ),
    'admin',
    FALSE,
    NOW()
  );
  RETURN NEW;
END;
$$;
