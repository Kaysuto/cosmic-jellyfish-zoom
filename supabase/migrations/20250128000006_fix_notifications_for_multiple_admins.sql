-- ========================================
-- CORRECTION DU SYSTÈME DE NOTIFICATIONS POUR MULTIPLES ADMINS
-- ========================================
-- Date: 2025-01-28
-- Description: Modifier le trigger pour créer des notifications pour chaque admin individuellement

-- 1. Modifier la fonction de notification pour créer une notification par admin
CREATE OR REPLACE FUNCTION public.fn_notify_on_media_request()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
DECLARE
  user_profile RECORD;
  admin_record RECORD;
BEGIN
  -- Récupérer les informations du profil utilisateur qui fait la demande
  SELECT first_name, last_name, email, avatar_url 
  INTO user_profile 
  FROM public.profiles 
  WHERE id = NEW.user_id;

  -- Créer une notification pour chaque admin
  FOR admin_record IN 
    SELECT id FROM public.profiles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (type, title, payload, recipient_id, is_read, created_at)
    VALUES (
      'media_request',
      COALESCE(NEW.title, NEW.tmdb_id::text),
      jsonb_build_object(
        'request_id', NEW.id,
        'tmdb_id', NEW.tmdb_id,
        'media_type', NEW.media_type,
        'user_id', NEW.user_id,
        'requested_at', COALESCE(NEW.requested_at, NOW()),
        'poster_path', NEW.poster_path,
        -- Ajouter les informations du profil utilisateur
        'first_name', COALESCE(user_profile.first_name, ''),
        'last_name', COALESCE(user_profile.last_name, ''),
        'email', COALESCE(user_profile.email, ''),
        'avatar_url', user_profile.avatar_url
      ),
      admin_record.id, -- recipient_id = ID de l'admin
      FALSE,
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$;
