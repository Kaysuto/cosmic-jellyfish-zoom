# Cosmic Jellyfish Zoom

Application de streaming et de gestion de médias avec interface moderne React + Vite.

## 🚀 Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn UI + Radix UI
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Streaming**: Jellyfin
- **Internationalisation**: react-i18next
- **État**: Zustand + TanStack Query

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build
```

## 🛠️ Scripts disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run preview          # Prévisualiser le build

# Build
npm run build            # Build de production
npm run build:dev        # Build de développement
npm run build:analyze    # Build avec analyse du bundle
npm run build:plesk      # Build pour Plesk
npm run build:optimized  # Build optimisé

# Maintenance
npm run cleanup          # Nettoyer les fichiers temporaires
npm run lint             # Vérifier le code

# Base de données
npm run confirm-admin    # Confirmer l'email admin
```

## 🗂️ Structure du projet

```
src/
├── components/          # Composants React
│   ├── admin/          # Interface d'administration
│   ├── auth/           # Authentification
│   ├── catalog/        # Catalogue de médias
│   ├── home/           # Page d'accueil
│   ├── layout/         # Layout principal
│   ├── media/          # Lecteur média
│   ├── status/         # Statut des services
│   └── ui/             # Composants UI réutilisables
├── contexts/           # Contextes React
├── hooks/              # Hooks personnalisés
├── integrations/       # Intégrations externes
├── lib/                # Utilitaires
├── locales/            # Fichiers de traduction
├── pages/              # Pages de l'application
├── types/              # Types TypeScript
└── utils/              # Utilitaires

scripts/                # Scripts utilitaires
├── build-production.js     # Build optimisé
├── build-static.js         # Build statique
├── cleanup.js              # Nettoyage
├── confirm-admin-email.js  # Gestion admin
├── create-plesk-package.js # Package Plesk
└── prevent-duplicate-requests.sql # Contrainte DB

supabase/               # Configuration Supabase
├── functions/          # Edge Functions
├── migrations/         # Migrations DB
└── config.toml         # Configuration
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon
VITE_JELLYFIN_URL=votre_url_jellyfin
VITE_TMDB_API_KEY=votre_clé_tmdb
VITE_TURNSTILE_SITE_KEY=votre_clé_turnstile
```

### Supabase

1. Créez un projet Supabase
2. Configurez l'authentification
3. Créez les tables nécessaires
4. Déployez les Edge Functions

### Jellyfin

1. Configurez votre serveur Jellyfin
2. Ajoutez l'URL dans les variables d'environnement
3. Configurez les permissions d'accès

## 🎯 Fonctionnalités

- ✅ **Authentification** avec Supabase Auth
- ✅ **Catalogue de médias** avec TMDB
- ✅ **Streaming** via Jellyfin
- ✅ **Demandes de médias** par les utilisateurs
- ✅ **Notifications** en temps réel
- ✅ **Interface d'administration**
- ✅ **Internationalisation** (FR/EN)
- ✅ **Design responsive**
- ✅ **Thème sombre/clair**

## 🚀 Déploiement

### Vercel

```bash
npm run build
# Déployer le dossier dist/
```

### Plesk

```bash
npm run build:plesk-zip
# Utiliser le fichier plesk-package.zip généré
```

## 📝 Maintenance

### Nettoyage

```bash
npm run cleanup
```

Ce script supprime :
- Fichiers de build temporaires
- Scripts de test et debug
- Documentation temporaire
- Cache de développement

### Base de données

Les scripts SQL dans `scripts/` permettent de :
- Prévenir les doublons de demandes
- Gérer les notifications
- Maintenir l'intégrité des données

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est privé et propriétaire.
