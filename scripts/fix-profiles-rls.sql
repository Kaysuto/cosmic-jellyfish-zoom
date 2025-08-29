-- Script pour corriger les politiques RLS de la table profiles
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier l'état actuel des politiques RLS
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 2. Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- 3. Recréer les politiques RLS correctement
-- Politique pour que les utilisateurs puissent voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politique pour que les admins puissent voir tous les profils
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Politique pour que les admins puissent gérer tous les profils
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 4. Vérifier que RLS est activé
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Vérifier les politiques créées
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 6. Test de la requête avec un utilisateur admin
-- (Cette requête devrait retourner tous les utilisateurs si vous êtes admin)
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count
FROM public.profiles;

-- 7. Afficher les utilisateurs existants (pour debug)
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  jellyfin_user_id,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;
