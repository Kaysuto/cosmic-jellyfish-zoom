-- Script pour ajouter la colonne has_mfa à la table profiles
-- À exécuter dans l'interface SQL de Supabase

-- Ajouter la colonne has_mfa à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_mfa BOOLEAN DEFAULT FALSE;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_has_mfa 
ON public.profiles(has_mfa);

-- Mettre à jour les utilisateurs existants qui ont des facteurs MFA
-- Cette requête sera exécutée par la fonction Edge get-all-users

-- Vérification
SELECT 
  'Colonne has_mfa ajoutée avec succès' as status,
  COUNT(*) as total_users,
  COUNT(CASE WHEN has_mfa = true THEN 1 END) as users_with_mfa
FROM public.profiles;
