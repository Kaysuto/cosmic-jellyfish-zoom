# Migration de l'Internationalisation (i18n)

## Vue d'ensemble

Ce projet a été migré d'un système d'internationalisation avec toutes les traductions hardcodées dans `src/lib/i18n.ts` vers un système modulaire utilisant des fichiers JSON séparés.

## Structure des fichiers

```
public/locales/
├── fr/                          # Traductions françaises
│   ├── common.json             # Traductions communes (navigation, UI, etc.)
│   ├── auth.json               # Authentification et gestion des comptes
│   ├── catalog.json            # Catalogue et médias
│   ├── requests.json           # Demandes de médias
│   ├── admin.json              # Administration et paramètres
│   ├── notifications.json      # Notifications système
│   ├── status.json             # Statut des services
│   ├── legal.json              # Pages légales (privacy, about, DMCA)
│   ├── community.json          # Communauté et Discord
│   ├── profile.json            # Profil utilisateur
│   ├── schedule.json           # Planning et sorties
│   └── services.json           # Services spécifiques (Jellyfin, etc.)
└── en/                          # Traductions anglaises
    ├── common.json
    ├── auth.json
    ├── catalog.json
    ├── requests.json
    ├── admin.json
    ├── notifications.json
    ├── status.json
    ├── legal.json
    ├── community.json
    ├── profile.json
    ├── schedule.json
    └── services.json
```

## Avantages de cette approche

### ✅ Maintenance facilitée
- **Modification simple** : Éditer les traductions sans toucher au code TypeScript
- **Séparation claire** : Code et traductions sont complètement séparés
- **Édition collaborative** : Les traducteurs peuvent modifier les JSON directement

### ✅ Organisation modulaire
- **Par domaine fonctionnel** : Chaque fichier correspond à une fonctionnalité
- **Facilité de navigation** : Trouver rapidement les traductions nécessaires
- **Évolutivité** : Ajouter de nouveaux modules sans affecter les existants

### ✅ Performance optimisée
- **Chargement dynamique** : Seules les traductions nécessaires sont chargées
- **Tree-shaking** : Vite peut optimiser le bundle selon les imports
- **Cache efficace** : Les fichiers JSON sont mis en cache par le navigateur

### ✅ Versioning et collaboration
- **Git-friendly** : Les fichiers JSON sont facilement versionnés
- **Diff clair** : Voir exactement quelles traductions ont changé
- **Merge simple** : Moins de conflits lors de la collaboration

## Utilisation

### Dans les composants React

```typescript
import { useTranslation } from 'react-i18next';

function MonComposant() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('catalog_title')}</h1>
      <p>{t('catalog_description')}</p>
      <button>{t('search')}</button>
    </div>
  );
}
```

### Ajouter de nouvelles traductions

1. **Identifier le module approprié** (ex: `catalog.json` pour les traductions du catalogue)
2. **Ajouter la clé dans les deux langues** :

```json
// public/locales/fr/catalog.json
{
  "nouvelle_traduction": "Nouvelle traduction en français"
}

// public/locales/en/catalog.json
{
  "nouvelle_traduction": "New translation in English"
}
```

3. **Utiliser dans le composant** :
```typescript
const { t } = useTranslation();
return <div>{t('nouvelle_traduction')}</div>;
```

## Migration depuis l'ancien système

### Ancien système (à éviter)
```typescript
// src/lib/i18n.ts - ANCIEN
const resources = {
  fr: {
    translation: {
      "search_placeholder": "Rechercher...",
      "login": "Connexion",
      // ... 1000+ lignes de traductions
    }
  }
};
```

### Nouveau système (recommandé)
```typescript
// src/lib/i18n.ts - NOUVEAU
const loadTranslations = async () => {
  const [frCommon, enCommon, frAuth, enAuth, /* ... */] = await Promise.all([
    import('/public/locales/fr/common.json'),
    import('/public/locales/en/common.json'),
    import('/public/locales/fr/auth.json'),
    import('/public/locales/en/auth.json'),
    // ...
  ]);
  
  return {
    fr: { translation: { ...frCommon.default, ...frAuth.default, /* ... */ } },
    en: { translation: { ...enCommon.default, ...enAuth.default, /* ... */ } }
  };
};
```

## Bonnes pratiques

### 1. Nommage des clés
- **Hiérarchique** : `catalog.search_placeholder`
- **Descriptif** : `auth.login_button` plutôt que `btn_login`
- **Cohérent** : Utiliser les mêmes patterns partout

### 2. Organisation des fichiers
- **Un fichier par domaine** : Ne pas mélanger les fonctionnalités
- **Taille raisonnable** : Éviter les fichiers de plus de 200 lignes
- **Cohérence** : Même structure dans les deux langues

### 3. Interpolation
```json
{
  "welcome_message": "Bonjour {{name}}, bienvenue !",
  "items_count": "{{count}} élément(s)"
}
```

### 4. Pluralisation
```json
{
  "seasons_0": "{{count}} saisons",
  "seasons_1": "{{count}} saison",
  "seasons_2": "{{count}} saisons"
}
```

## Dépannage

### Erreur de chargement des traductions
- Vérifier que tous les fichiers JSON existent
- Contrôler la syntaxe JSON (pas de virgule trailing)
- Vérifier les chemins d'import

### Traduction manquante
- Ajouter la clé dans les deux fichiers de langue
- Vérifier l'orthographe de la clé
- Redémarrer le serveur de développement

### Performance
- Les traductions sont chargées de manière asynchrone
- Le fallback en français est utilisé en cas d'erreur
- Les traductions sont mises en cache par le navigateur

## Évolution future

Cette architecture permet facilement :
- **Ajout de nouvelles langues** : Créer un nouveau dossier (ex: `es/`)
- **Traductions conditionnelles** : Charger des modules selon les besoins
- **Traductions dynamiques** : Charger depuis une API externe
- **Tests automatisés** : Vérifier la cohérence des traductions
