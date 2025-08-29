-- ========================================
-- AJOUT DE LA COLONNE JELLYFIN_USER_ID À LA TABLE PROFILES
-- ========================================
-- Date: 2025-01-28
-- Description: Ajout de la colonne jellyfin_user_id pour le mapping des utilisateurs

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
SELECT 'Migration jellyfin_user_id terminée avec succès' as status;
