# Restructuration du Catalogue - Séparation des Sections

## Vue d'ensemble

Cette restructuration sépare clairement les pages "/discover" de chaque section du catalogue afin d'éviter le mélange actuel des contenus. Chaque section maintient maintenant une exclusivité totale de son type de contenu.

## Nouvelles Sections

### 1. Section "Animations" (`/discover/animations`)
- **Contenu autorisé** : Uniquement les films d'animation occidentaux
- **Contenu exclu** : Animés, mangas et tout autre type de média
- **Filtres appliqués** :
  - Genre 16 (Animation) inclus
  - Genre 10751 (Family) exclu
  - Pays d'origine JP, KR, CN exclus
- **Principe** : Cette section est dédiée exclusivement aux animations occidentales

### 2. Section "Animés" (`/discover/animes`)
- **Contenu autorisé** : Uniquement les animés japonais, chinois et coréens
- **Contenu exclu** : Films d'animation occidentaux, séries live-action
- **Filtres appliqués** :
  - Genre 16 (Animation) inclus
  - Pays d'origine JP, KR, CN inclus
- **Principe** : Cette section est réservée aux productions animées asiatiques

### 3. Section "Films" (`/discover/films`)
- **Contenu autorisé** : Uniquement les films en prise de vue réelle (live-action)
- **Contenu exclu** : Films d'animation, animés
- **Filtres appliqués** :
  - Genre 16 (Animation) exclu
  - Pays d'origine JP, KR, CN exclus
- **Principe** : Cette section concerne exclusivement le cinéma traditionnel hors animation

### 4. Section "Séries" (`/discover/series`)
- **Contenu autorisé** : Uniquement les séries en prise de vue réelle (live-action)
- **Contenu exclu** : Animés, films
- **Filtres appliqués** :
  - Genre 16 (Animation) exclu
  - Pays d'origine JP, KR, CN exclus
- **Principe** : Cette section est dédiée aux productions sérielles traditionnelles

## Modifications Techniques

### 1. Fonction `discover-media` (`supabase/functions/discover-media/index.ts`)
- Remplacement du paramètre `mediaType` par `section`
- Ajout de la configuration `CATALOG_SECTIONS` avec filtres spécifiques
- Application automatique des filtres selon la section

### 2. Composants Frontend
- **`CatalogNavigation.tsx`** : Nouveau composant de navigation avec 4 sections
- **`CatalogSections.tsx`** : Composant d'affichage sur la page d'accueil
- **`FullSectionPage.tsx`** : Adaptation pour supporter les nouvelles sections
- **`Catalog.tsx`** : Intégration de la nouvelle navigation

### 3. Routes
- Remplacement de `/discover/:mediaType` par `/discover/:section`
- Support des nouvelles sections : animations, animes, films, series

### 4. Traductions
- Ajout des traductions pour les nouvelles sections
- Support français et anglais
- Descriptions spécifiques pour chaque section

## Migration des Anciennes Routes

| Ancienne Route | Nouvelle Route | Description |
|----------------|----------------|-------------|
| `/discover/movie` | `/discover/films` | Films live-action uniquement |
| `/discover/tv` | `/discover/series` | Séries live-action uniquement |
| `/discover/anime` | `/discover/animes` | Animés asiatiques uniquement |
| - | `/discover/animations` | Nouvelle section pour animations occidentales |

## Interface Utilisateur

### Navigation Principale
- Interface moderne avec 4 cartes distinctes
- Icônes spécifiques pour chaque section
- Descriptions claires du contenu inclus
- États actifs pour la navigation

### Page d'Accueil
- Section dédiée aux sections du catalogue
- Animations et transitions fluides
- Design responsive et moderne

### Page Catalogue
- Navigation intégrée des sections
- Recherche simplifiée
- Affichage des bibliothèques Jellyfin

## Avantages

1. **Séparation claire** : Chaque section contient uniquement le type de média approprié
2. **Navigation intuitive** : Interface claire pour les utilisateurs
3. **Filtrage automatique** : Plus de mélange de contenus
4. **Extensibilité** : Structure prête pour de futures sections
5. **Performance** : Filtrage côté serveur pour de meilleures performances

## Tests Recommandés

1. Vérifier que chaque section affiche uniquement le contenu approprié
2. Tester la navigation entre les sections
3. Vérifier que les anciennes URLs redirigent correctement
4. Tester la recherche dans chaque section
5. Vérifier l'affichage sur mobile et desktop

## Maintenance

- Les filtres peuvent être ajustés dans `CATALOG_SECTIONS`
- Les traductions peuvent être modifiées dans `i18n.ts`
- Les icônes et couleurs peuvent être personnalisées dans les composants
