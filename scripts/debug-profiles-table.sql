-- Script pour déboguer la table profiles
-- À exécuter dans l'interface SQL de Supabase

-- 1. Désactiver temporairement RLS pour voir tous les utilisateurs
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Compter tous les utilisateurs
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
  COUNT(CASE WHEN role IS NULL THEN 1 END) as null_role_count
FROM public.profiles;

-- 3. Afficher tous les utilisateurs
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  jellyfin_user_id,
  jellyfin_username,
  created_at,
  updated_at
FROM public.profiles
ORDER BY created_at DESC;

-- 4. Vérifier les utilisateurs avec votre ID
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  jellyfin_user_id,
  jellyfin_username,
  created_at
FROM public.profiles
WHERE id = '95cdd346-d47c-4a3b-9de5-66280d85a435';

-- 5. Vérifier s'il y a des utilisateurs avec des rôles différents
SELECT 
  role,
  COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY count DESC;

-- 6. Réactiver RLS après le debug
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Test avec RLS activé (devrait retourner seulement votre profil)
SELECT 
  COUNT(*) as users_with_rls,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_with_rls
FROM public.profiles;
