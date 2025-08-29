# Configuration des Variables d'Environnement pour les Fonctions Edge

## Problème
La fonction Edge `get-all-users` retourne une erreur 500 car les variables d'environnement `SUPABASE_SERVICE_ROLE_KEY` n'est pas configurée.

## Solution

### 1. Accéder au Dashboard Supabase
1. Allez sur https://supabase.com/dashboard/project/tgffkwoekuaetahrwioo/settings/functions
2. Connectez-vous à votre compte Supabase

### 2. Configurer les Variables d'Environnement
1. Dans la section "Edge Functions", cliquez sur "Environment variables"
2. Ajoutez les variables suivantes :

```
SUPABASE_URL = https://tgffkwoekuaetahrwioo.supabase.co
SUPABASE_SERVICE_ROLE_KEY = [votre-clé-de-service]
```

### 3. Obtenir la Clé de Service
1. Allez sur https://supabase.com/dashboard/project/tgffkwoekuaetahrwioo/settings/api
2. Copiez la "service_role" key (commence par `eyJ...`)
3. Collez-la dans la variable `SUPABASE_SERVICE_ROLE_KEY`

### 4. Redéployer la Fonction
Après avoir configuré les variables d'environnement, redéployez la fonction :

```bash
npx supabase functions deploy get-all-users
```

### 5. Tester la Fonction
Utilisez le script de test pour vérifier que tout fonctionne :

```bash
node scripts/test-get-all-users.js
```

## Alternative : Test Direct
Si vous avez la clé de service, vous pouvez tester directement :

```bash
export SUPABASE_SERVICE_ROLE_KEY="votre-clé-de-service"
node scripts/test-get-all-users.js
```

## Notes Importantes
- La clé de service a des privilèges élevés, ne la partagez jamais
- Les variables d'environnement sont spécifiques à chaque projet
- Après modification des variables, il peut y avoir un délai de quelques minutes avant qu'elles soient prises en compte
