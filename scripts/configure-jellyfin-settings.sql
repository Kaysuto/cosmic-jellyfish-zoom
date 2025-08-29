-- Configuration des paramètres Jellyfin
-- À exécuter dans l'interface SQL de Supabase

-- 1. Mettre à jour les paramètres Jellyfin
UPDATE public.jellyfin_settings 
SET 
  url = 'https://playjelly.fr',
  api_key = '6ad7238735cd431c9384911bcdc3090c',
  updated_at = NOW()
WHERE id = 1;

-- 2. Vérifier la configuration
SELECT 
  'Configuration Jellyfin mise à jour!' as status,
  url,
  CASE 
    WHEN api_key != '' THEN 'API Key configurée'
    ELSE 'API Key manquante'
  END as api_key_status,
  updated_at
FROM public.jellyfin_settings 
WHERE id = 1;
