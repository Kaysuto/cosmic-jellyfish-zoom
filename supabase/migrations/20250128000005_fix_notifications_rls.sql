-- ========================================
-- CORRECTION DES POLITIQUES RLS POUR NOTIFICATIONS
-- ========================================
-- Date: 2025-01-28
-- Description: Configuration des politiques RLS pour permettre aux utilisateurs de gérer leurs notifications

-- ========================================
-- 1. ACTIVER RLS SUR LA TABLE NOTIFICATIONS
-- ========================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. SUPPRIMER LES ANCIENNES POLITIQUES
-- ========================================
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

-- ========================================
-- 3. CRÉER LES NOUVELLES POLITIQUES
-- ========================================

-- Politique pour permettre aux utilisateurs de voir leurs propres notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (
    recipient_id = auth.uid()
  );

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres notifications
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (
    recipient_id = auth.uid()
  );

-- Politique pour permettre aux utilisateurs de supprimer leurs propres notifications
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (
    recipient_id = auth.uid()
  );

-- Politique pour permettre aux admins de voir toutes les notifications
CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique pour permettre aux admins de gérer toutes les notifications
CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- 4. VÉRIFICATION
-- ========================================
SELECT 'Politiques RLS pour notifications configurées avec succès' as status;
