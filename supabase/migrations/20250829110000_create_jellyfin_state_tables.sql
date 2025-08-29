-- Tables d'état Jellyfin (sans doublons)
-- Table unique pour l'état courant des statistiques globales
CREATE TABLE IF NOT EXISTS public.jellyfin_statistics_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  server_info JSONB,
  library_info JSONB,
  categorized_stats JSONB,
  user_count INTEGER DEFAULT 0,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table normalisée pour l'état courant des bibliothèques (une ligne par bibliothèque)
CREATE TABLE IF NOT EXISTS public.jellyfin_libraries_state (
  id TEXT PRIMARY KEY, -- Jellyfin ItemId
  name TEXT NOT NULL,
  collection_type TEXT,
  category TEXT,
  path TEXT,
  movie_count INTEGER DEFAULT 0,
  series_count INTEGER DEFAULT 0,
  episode_count INTEGER DEFAULT 0,
  total_count INTEGER GENERATED ALWAYS AS (COALESCE(movie_count,0) + COALESCE(series_count,0) + COALESCE(episode_count,0)) STORED,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.jellyfin_statistics_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jellyfin_libraries_state ENABLE ROW LEVEL SECURITY;

-- Admins uniquement
CREATE POLICY IF NOT EXISTS "Admins can manage jellyfin statistics state" ON public.jellyfin_statistics_state
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can manage jellyfin libraries state" ON public.jellyfin_libraries_state
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Triggers updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.jellyfin_statistics_state;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.jellyfin_statistics_state
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.jellyfin_libraries_state;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.jellyfin_libraries_state
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Enregistrement unique par défaut
INSERT INTO public.jellyfin_statistics_state (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.jellyfin_statistics_state IS 'État courant des statistiques Jellyfin (unique)';
COMMENT ON TABLE public.jellyfin_libraries_state IS 'État courant des bibliothèques Jellyfin (une ligne par bibliothèque)';

