-- CORRECTION DE LA POLITIQUE RLS POUR JELLYFIN_SETTINGS
-- Migration: 20250128000008_fix_jellyfin_settings_policy.sql
-- Description: Correction de la politique RLS qui cause des erreurs lors des migrations

-- Supprimer la politique existante si elle existe
DROP POLICY IF EXISTS "Admins can manage jellyfin settings" ON public.jellyfin_settings;

-- Recréer la politique RLS pour jellyfin_settings
CREATE POLICY "Admins can manage jellyfin settings" ON public.jellyfin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Message de confirmation
SELECT 'Politique jellyfin_settings corrigée avec succès' as status;
