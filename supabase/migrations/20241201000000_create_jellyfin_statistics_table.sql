-- Création de la table jellyfin_statistics pour stocker les statistiques Jellyfin
CREATE TABLE IF NOT EXISTS jellyfin_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  server_info JSONB,
  library_info JSONB,
  libraries JSONB,
  categorized_stats JSONB,
  user_count INTEGER DEFAULT 0,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_jellyfin_statistics_created_at ON jellyfin_statistics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jellyfin_statistics_last_sync ON jellyfin_statistics(last_sync DESC);

-- RLS (Row Level Security) - Seuls les admins peuvent accéder
ALTER TABLE jellyfin_statistics ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'accès aux admins uniquement
CREATE POLICY "Admins can manage jellyfin statistics" ON jellyfin_statistics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_jellyfin_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_jellyfin_statistics_updated_at
  BEFORE UPDATE ON jellyfin_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_jellyfin_statistics_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE jellyfin_statistics IS 'Table pour stocker les statistiques Jellyfin synchronisées';
COMMENT ON COLUMN jellyfin_statistics.server_info IS 'Informations du serveur Jellyfin (nom, version, etc.)';
COMMENT ON COLUMN jellyfin_statistics.library_info IS 'Informations globales de la bibliothèque (nombre de films, séries)';
COMMENT ON COLUMN jellyfin_statistics.libraries IS 'Détails des bibliothèques individuelles';
COMMENT ON COLUMN jellyfin_statistics.categorized_stats IS 'Statistiques par catégorie (films, séries, anime, etc.)';
COMMENT ON COLUMN jellyfin_statistics.user_count IS 'Nombre total d''utilisateurs Jellyfin';
COMMENT ON COLUMN jellyfin_statistics.last_sync IS 'Timestamp de la dernière synchronisation';
