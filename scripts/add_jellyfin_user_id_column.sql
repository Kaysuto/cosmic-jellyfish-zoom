-- Script pour ajouter la colonne jellyfin_user_id à la table profiles
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter la colonne jellyfin_user_id à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS jellyfin_user_id TEXT;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_jellyfin_user_id 
ON public.profiles(jellyfin_user_id);

-- Ajouter une contrainte pour s'assurer qu'un utilisateur Jellyfin n'est mappé qu'à un seul profil
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_jellyfin_user_id_unique 
ON public.profiles(jellyfin_user_id) 
WHERE jellyfin_user_id IS NOT NULL;

-- Vérification
SELECT 'Colonne jellyfin_user_id ajoutée avec succès' as status;
