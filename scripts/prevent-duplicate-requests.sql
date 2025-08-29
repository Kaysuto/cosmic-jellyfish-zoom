-- ========================================
-- PRÉVENTION DES DEMANDES EN DOUBLE
-- ========================================
-- Exécutez ce script dans l'interface SQL de Supabase

-- 1. Vérifier les demandes en double existantes
SELECT 
  user_id,
  tmdb_id,
  COUNT(*) as duplicate_count
FROM public.media_requests 
GROUP BY user_id, tmdb_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. Supprimer les demandes en double (garder la plus récente)
DELETE FROM public.media_requests 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id, tmdb_id ORDER BY updated_at DESC) as rn
    FROM public.media_requests
  ) t
  WHERE t.rn > 1
);

-- 3. Ajouter une contrainte unique pour empêcher les futures demandes en double
-- Cette contrainte empêchera un utilisateur de faire plusieurs demandes pour le même média
ALTER TABLE public.media_requests 
ADD CONSTRAINT unique_user_media_request 
UNIQUE (user_id, tmdb_id);

-- 4. Vérifier que la contrainte a été ajoutée
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'media_requests' 
AND constraint_name = 'unique_user_media_request';

-- 5. Vérification finale
SELECT 'Contrainte unique ajoutée avec succès' as status;
