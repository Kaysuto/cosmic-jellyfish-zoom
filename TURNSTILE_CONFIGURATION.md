# 🔐 Configuration Cloudflare Turnstile

## Problème
La page de connexion nécessite l'activation de Cloudflare Turnstile pour la sécurité.

## Solution

### 1. Configuration Cloudflare Turnstile

1. **Aller sur Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Section **Turnstile** → **Add site**

2. **Configurer le site**
   - **Domains** : `tgffkwoekuaetahrwioo.supabase.co` (ou votre domaine)
   - **Widget Mode** : `Managed`
   - **Security Level** : `Standard`

3. **Récupérer les clés**
   - **Site Key** : Clé publique pour le frontend
   - **Secret Key** : Clé secrète pour le backend

### 2. Configuration des Variables d'Environnement

Ajouter dans votre fichier `.env` :

```env
# Cloudflare Turnstile
VITE_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here
```

### 3. Configuration Supabase

```bash
# Ajouter la clé secrète à Supabase
supabase secrets set TURNSTILE_SECRET_KEY=your_secret_key_here

# Déployer la fonction de vérification
supabase functions deploy verify-turnstile
```

### 4. Vérification

Après configuration :
- ✅ Turnstile apparaîtra sur la page de connexion
- ✅ La vérification sera requise avant connexion
- ✅ La sécurité sera renforcée

## Fonctionnalités Actives

- 🔒 Captcha sur connexion
- 🔒 Captcha sur inscription  
- 🔒 Captcha sur réinitialisation mot de passe
- 🔒 Validation côté serveur
- 🔒 Gestion des erreurs

## Support

- [Documentation Turnstile](https://developers.cloudflare.com/turnstile/)
- [Guide d'intégration](https://developers.cloudflare.com/turnstile/get-started/)
