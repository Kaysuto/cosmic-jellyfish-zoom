-- Script pour insérer les paramètres Jellyfin par défaut
-- À exécuter dans l'interface SQL de Supabase

-- Vérifier si l'enregistrement existe déjà
SELECT * FROM public.jellyfin_settings WHERE id = 1;

-- Insérer l'enregistrement par défaut s'il n'existe pas
INSERT INTO public.jellyfin_settings (id, url, api_key)
VALUES (1, '', '')
ON CONFLICT (id) DO NOTHING;

-- Vérifier le résultat
SELECT * FROM public.jellyfin_settings;

-- Instructions pour configurer :
-- 1. Remplacez 'votre_url_jellyfin' par l'URL de votre serveur Jellyfin
-- 2. Remplacez 'votre_clé_api' par la clé API Jellyfin
-- 
-- Exemple :
-- UPDATE public.jellyfin_settings 
-- SET url = 'http://192.168.1.100:8096', 
--     api_key = 'votre_clé_api_jellyfin' 
-- WHERE id = 1;
