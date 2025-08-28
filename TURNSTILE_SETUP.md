# Configuration Cloudflare Turnstile

## Étapes de configuration

### 1. Créer un site Turnstile sur Cloudflare

1. Connectez-vous à votre [dashboard Cloudflare](https://dash.cloudflare.com)
2. Allez dans la section **Turnstile** (ou naviguez vers `/:account/turnstile`)
3. Cliquez sur **"Add site"**
4. Configurez votre site :
   - **Domains** : Ajoutez vos domaines autorisés
   - **Widget Mode** : Choisissez "Managed" pour une expérience utilisateur optimale
   - **Security Level** : Choisissez "Standard" ou "Challenge" selon vos besoins

### 2. Récupérer vos clés

Après avoir créé votre site, vous obtiendrez :
- **Site Key** : Clé publique à utiliser côté client
- **Secret Key** : Clé secrète à utiliser côté serveur

### 3. Configuration des variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```env
# Cloudflare Turnstile Configuration
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
TURNSTILE_SECRET_KEY=your_turnstile_secret_key_here
```

### 4. Configuration Supabase

Pour la fonction Edge Function, ajoutez la variable d'environnement dans votre projet Supabase :

```bash
supabase secrets set TURNSTILE_SECRET_KEY=your_turnstile_secret_key_here
```

### 5. Déploiement de la fonction Edge

Déployez la fonction de vérification :

```bash
supabase functions deploy verify-turnstile
```

## Fonctionnalités implémentées

- ✅ Captcha Turnstile sur la page de connexion
- ✅ Captcha Turnstile sur la page d'inscription
- ✅ Captcha Turnstile sur la page de réinitialisation de mot de passe
- ✅ Validation côté serveur via Supabase Edge Function
- ✅ Gestion des erreurs et des états de chargement
- ✅ Interface utilisateur responsive et accessible

## Sécurité

- Les tokens Turnstile sont vérifiés côté serveur avant toute action d'authentification
- La clé secrète n'est jamais exposée côté client
- Validation de l'IP du client pour une sécurité renforcée
- Gestion des erreurs et des tentatives d'abus

## Personnalisation

Le composant Turnstile peut être personnalisé avec :
- **Theme** : `light` ou `dark`
- **Size** : `normal`, `compact`, ou `invisible`
- **Callback functions** : pour gérer les événements de vérification

## Support

Pour plus d'informations sur Turnstile :
- [Documentation officielle Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
- [Guide d'intégration](https://developers.cloudflare.com/turnstile/get-started/)
