-- Script complet pour corriger le mapping Jellyfin
-- À exécuter dans le Supabase Dashboard SQL Editor

-- 1. Ajouter la colonne jellyfin_email si elle n'existe pas
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS jellyfin_email TEXT;

-- 2. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_jellyfin_email 
ON profiles(jellyfin_email);

-- 3. Corriger spécifiquement l'utilisateur Kimiya
UPDATE profiles 
SET 
  jellyfin_username = 'Kimiya',
  jellyfin_email = 'kimiya@jellyfin.local'
WHERE email = 'kaysuto@gmail.com';

-- 4. Vérifier le résultat pour Kimiya
SELECT 
  id, 
  email, 
  jellyfin_username, 
  jellyfin_email, 
  jellyfin_user_id
FROM profiles 
WHERE email = 'kaysuto@gmail.com';

-- 5. Vérifier tous les utilisateurs avec mapping Jellyfin
SELECT 
  id, 
  email, 
  jellyfin_username, 
  jellyfin_email, 
  jellyfin_user_id
FROM profiles 
WHERE jellyfin_username IS NOT NULL 
   OR jellyfin_email IS NOT NULL
ORDER BY jellyfin_username;

-- Message de confirmation
SELECT 'Mapping Jellyfin corrigé avec succès!' as status;
