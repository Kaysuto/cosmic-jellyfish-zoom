-- FONCTION POUR VÉRIFIER LA STRUCTURE DES TABLES
-- Migration: 20250128000009_add_table_structure_check.sql
-- Description: Ajout d'une fonction RPC pour vérifier la structure des tables

-- Fonction pour obtenir les colonnes d'une table
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable text,
  column_default text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text
  FROM information_schema.columns c
  WHERE c.table_schema = 'public' 
    AND c.table_name = $1
  ORDER BY c.ordinal_position;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION get_table_columns(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(text) TO anon;

-- Message de confirmation
SELECT 'Fonction get_table_columns créée avec succès' as status;
