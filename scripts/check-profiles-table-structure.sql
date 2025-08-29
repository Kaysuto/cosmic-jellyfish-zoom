-- Script pour vérifier la structure de la table profiles
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier toutes les colonnes de la table profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Vérifier si la colonne created_at existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'created_at'
    ) THEN 'created_at existe'
    ELSE 'created_at n\'existe PAS'
  END as created_at_status;

-- 3. Vérifier si la colonne updated_at existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN 'updated_at existe'
    ELSE 'updated_at n\'existe PAS'
  END as updated_at_status;

-- 4. Compter le nombre d'utilisateurs
SELECT COUNT(*) as total_users FROM public.profiles;

-- 5. Afficher quelques utilisateurs pour voir la structure
SELECT * FROM public.profiles LIMIT 3;
