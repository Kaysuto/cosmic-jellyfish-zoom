-- AJOUT DES COLONNES JELLYFIN À LA TABLE PROFILES
-- Migration: 20250128000006_add_jellyfin_fields_to_profiles.sql
-- Description: Ajout des colonnes jellyfin_username et is_administrator pour les utilisateurs Jellyfin

-- Ajouter la colonne jellyfin_username à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS jellyfin_username TEXT;

-- Ajouter la colonne is_administrator à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_administrator BOOLEAN DEFAULT FALSE;

-- Créer un index sur jellyfin_username pour les recherches
CREATE INDEX IF NOT EXISTS idx_profiles_jellyfin_username
ON public.profiles(jellyfin_username);

-- Créer un index sur is_administrator pour les filtres admin
CREATE INDEX IF NOT EXISTS idx_profiles_is_administrator
ON public.profiles(is_administrator);

-- Message de confirmation
SELECT 'Migration jellyfin_fields terminée avec succès' as status;
