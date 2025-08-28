# Configuration Jellyfin

## Problème de connexion

Si vous voyez le message "Jellyfin n'est pas connecté. Configurez d'abord les paramètres de connexion.", cela signifie que la table `jellyfin_settings` n'existe pas dans votre base de données Supabase.

## Solution

### 1. Créer la table jellyfin_settings

Exécutez le script SQL suivant dans l'éditeur SQL de votre projet Supabase :

```sql
-- Create Jellyfin Settings Table
CREATE TABLE IF NOT EXISTS public.jellyfin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.jellyfin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read and write jellyfin settings
CREATE POLICY "Admins can manage jellyfin settings" ON public.jellyfin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert default record
INSERT INTO public.jellyfin_settings (id, url, api_key) 
VALUES (1, '', '') 
ON CONFLICT (id) DO NOTHING;
```

### 2. Configurer Jellyfin

1. Allez dans votre serveur Jellyfin
2. Accédez aux paramètres d'administration
3. Dans la section "API Keys", générez une nouvelle clé API
4. Notez l'URL de votre serveur Jellyfin (ex: `http://192.168.1.10:8096`)

### 3. Configurer l'application

1. Allez dans la section Admin de l'application
2. Cliquez sur "Jellyfin" dans le menu
3. Remplissez les champs :
   - **URL de Jellyfin** : L'URL de votre serveur
   - **Clé API de Jellyfin** : La clé API générée
4. Cliquez sur "Enregistrer les paramètres"
5. Cliquez sur "Synchroniser maintenant" pour tester la connexion

## Vérification

Une fois configuré, vous devriez voir :
- Le statut de connexion passer à "Connecté"
- Les statistiques de vos bibliothèques s'afficher
- La possibilité de synchroniser les utilisateurs

## Dépannage

Si la connexion échoue :
1. Vérifiez que l'URL de Jellyfin est correcte et accessible
2. Vérifiez que la clé API est valide
3. Assurez-vous que votre serveur Jellyfin est démarré
4. Vérifiez les logs de la console pour plus de détails
