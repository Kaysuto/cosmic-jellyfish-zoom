# Pages d'Erreur Améliorées

## Vue d'ensemble

Le site dispose maintenant de pages d'erreur modernes et cohérentes avec le design global. Tous les composants utilisent Framer Motion pour les animations et suivent le système de design établi.

## Composants Disponibles

### 1. ErrorBoundary (Composant de base)
**Fichier :** `src/components/ErrorBoundary.tsx`

Composant React qui capture les erreurs JavaScript et affiche une page d'erreur élégante.

**Caractéristiques :**
- ✅ Design moderne avec animations
- ✅ Icônes Lucide cohérentes
- ✅ Boutons d'action multiples (Rafraîchir, Retour, Accueil)
- ✅ Détails d'erreur en mode développement
- ✅ Filtrage des erreurs Cloudflare
- ✅ Support du mode production/développement

**Utilisation :**
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <MonComposant />
</ErrorBoundary>
```

### 2. ErrorPage (Composant réutilisable)
**Fichier :** `src/components/ui/ErrorPage.tsx`

Composant générique pour créer des pages d'erreur personnalisées.

**Props :**
- `title` : Titre de l'erreur
- `description` : Description de l'erreur
- `icon` : Icône Lucide
- `iconColor` : Couleur de l'icône (défaut: "text-red-500")
- `gradientColors` : Couleurs du gradient de fond
- `actions` : Actions personnalisées
- `details` : Détails supplémentaires
- `badge` : Badge informatif
- `showBackButton` : Afficher le bouton retour (défaut: true)
- `showHomeButton` : Afficher le bouton accueil (défaut: true)

**Exemple d'utilisation :**
```tsx
import ErrorPage from '@/components/ui/ErrorPage';
import { AlertTriangle } from 'lucide-react';

<ErrorPage
  title="Erreur de connexion"
  description="Impossible de se connecter au serveur."
  icon={AlertTriangle}
  iconColor="text-red-500"
  gradientColors={{
    from: "from-red-500/5",
    via: "via-orange-500/5",
    to: "to-yellow-500/5"
  }}
  badge={{
    text: "Erreur réseau",
    variant: "destructive",
    icon: AlertTriangle
  }}
/>
```

### 3. MaintenanceError (Erreur de maintenance)
**Fichier :** `src/components/ui/MaintenanceError.tsx`

Composant spécialisé pour les pages en maintenance.

**Props :**
- `title` : Titre (défaut: "Site en maintenance")
- `description` : Description
- `estimatedTime` : Temps estimé de maintenance
- `contactInfo` : Informations de contact

**Exemple d'utilisation :**
```tsx
import MaintenanceError from '@/components/ui/MaintenanceError';

<MaintenanceError
  title="Maintenance planifiée"
  description="Nous améliorons nos serveurs pour une meilleure performance."
  estimatedTime="2 heures"
  contactInfo="support@example.com"
/>
```

### 4. NotFound (Page 404)
**Fichier :** `src/pages/NotFound.tsx`

Page d'erreur 404 modernisée avec :
- ✅ Design cohérent avec le site
- ✅ Affichage de l'URL recherchée
- ✅ Liens rapides vers les pages populaires
- ✅ Animations fluides
- ✅ Actions multiples (Accueil, Retour)

### 5. ModuleLoadError (Erreur de chargement de module)
**Fichier :** `src/components/ui/ModuleLoadError.tsx`

Composant spécialisé pour les erreurs de chargement de modules dynamiques :
- ✅ Détection automatique des erreurs de module
- ✅ Bouton de retry avec vidage de cache
- ✅ Détails techniques en mode développement
- ✅ Actions de récupération avancées

### 6. useModuleError (Hook de gestion d'erreur)
**Fichier :** `src/hooks/useModuleError.ts`

Hook personnalisé pour gérer les erreurs de modules :
- ✅ État d'erreur centralisé
- ✅ Fonctions de retry et clear
- ✅ Gestion du cache navigateur
- ✅ Logging automatique

## Design System

### Couleurs d'erreur
- **Erreur générale** : Rouge (`text-red-500`)
- **Erreur 404** : Bleu (`text-blue-500`)
- **Maintenance** : Bleu (`text-blue-500`)
- **Avertissement** : Orange (`text-orange-500`)

### Animations
- **Entrée** : Fade in + scale + slide up
- **Icône** : Scale avec spring animation
- **Détails** : Fade in avec délai
- **Boutons** : Hover scale + transition

### Composants UI utilisés
- `Card` avec backdrop blur
- `Button` avec gradients
- `Badge` pour les étiquettes
- `motion.div` pour les animations

## Bonnes Pratiques

### 1. Gestion des erreurs
```tsx
// Toujours wrapper les composants critiques
<ErrorBoundary>
  <ComposantCritique />
</ErrorBoundary>
```

### 2. Messages d'erreur
- Utiliser un langage clair et rassurant
- Expliquer ce qui s'est passé
- Proposer des solutions
- Éviter le jargon technique

### 3. Actions utilisateur
- Toujours proposer plusieurs options
- Bouton principal pour l'action la plus probable
- Bouton secondaire pour les alternatives
- Bouton d'aide si nécessaire

### 4. Mode développement
- Afficher les détails techniques uniquement en dev
- Utiliser des badges pour identifier le mode
- Masquer les informations sensibles

## Personnalisation

### Créer une erreur personnalisée
```tsx
import ErrorPage from '@/components/ui/ErrorPage';
import { Database } from 'lucide-react';

const DatabaseError = () => (
  <ErrorPage
    title="Erreur de base de données"
    description="Impossible de récupérer les données."
    icon={Database}
    iconColor="text-purple-500"
    gradientColors={{
      from: "from-purple-500/5",
      via: "via-pink-500/5",
      to: "to-red-500/5"
    }}
    badge={{
      text: "Erreur DB",
      variant: "destructive"
    }}
  />
);
```

### Ajouter des actions personnalisées
```tsx
<ErrorPage
  title="Erreur de paiement"
  description="Le paiement n'a pas pu être traité."
  icon={CreditCard}
  actions={
    <div className="space-y-3">
      <Button onClick={retryPayment}>
        Réessayer le paiement
      </Button>
      <Button variant="outline" onClick={contactSupport}>
        Contacter le support
      </Button>
    </div>
  }
/>
```

## Support et Maintenance

### Ajout de nouvelles erreurs
1. Créer un nouveau composant basé sur `ErrorPage`
2. Définir les couleurs et icônes appropriées
3. Ajouter les actions spécifiques
4. Tester en mode développement et production

### Gestion des erreurs de modules dynamiques
1. Utiliser `ModuleLoadError` pour les erreurs de chargement
2. Implémenter `useModuleError` pour la gestion d'état
3. Configurer les imports dynamiques avec des chemins absolus (`@/`)
4. Tester la résolution des modules en développement et production

### Mise à jour du design
- Modifier `ErrorPage.tsx` pour les changements globaux
- Utiliser les variables CSS pour la cohérence
- Tester sur différents appareils et navigateurs

### Monitoring
- Les erreurs sont loggées en console
- En production, considérer l'ajout de Sentry ou LogRocket
- Surveiller les erreurs fréquentes pour améliorer l'UX
- Surveiller les erreurs de chargement de modules dynamiques
