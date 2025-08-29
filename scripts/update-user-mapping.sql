-- Mise à jour du mapping utilisateur Jellyfin
-- À exécuter dans l'interface SQL de Supabase

-- 1. Mettre à jour le profil avec les informations Jellyfin
-- Utiliser l'ID du profil dans la base de données, pas l'ID Jellyfin
UPDATE public.profiles 
SET 
  jellyfin_username = 'Kimiya',
  is_administrator = true,
  jellyfin_user_id = 'e5b77f53698541239d6d9b365f1dd18e'
WHERE id = '95cdd346-d47c-4a3b-9de5-66280d85a435';

-- 2. Vérifier la mise à jour
SELECT 
  id,
  email,
  jellyfin_username,
  jellyfin_user_id,
  is_administrator,
  role
FROM public.profiles 
WHERE id = '95cdd346-d47c-4a3b-9de5-66280d85a435';

-- 3. Vérifier tous les mappings Jellyfin
SELECT 
  id,
  email,
  jellyfin_username,
  jellyfin_user_id,
  is_administrator,
  role
FROM public.profiles 
WHERE jellyfin_username IS NOT NULL 
   OR jellyfin_user_id IS NOT NULL
ORDER BY email;
