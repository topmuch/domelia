# Domelia.fr

Plateforme immobilière avec modèle inversé : les locataires publient leur profil, les propriétaires les contactent.

## 🚀 Déploiement avec Coolify

### Prérequis
- Serveur avec Coolify installé
- Domaine configuré (ex: domelia.fr)

### Étapes de déploiement

1. **Créer une nouvelle application dans Coolify**
   - Type: Docker
   - Source: Git Repository
   - Repository: `https://github.com/topmuch/domelia`
   - Branch: `main`

2. **Configurer les variables d'environnement**
   ```
   DATABASE_URL=file:/app/db/production.db
   NEXTAUTH_URL=https://domelia.fr
   NEXTAUTH_SECRET=<générer-une-clé-secrète>
   ADMIN_PASSWORD=<votre-mot-de-passe-admin>
   NODE_ENV=production
   ```

3. **Configurer le volume persistant**
   - Path: `/app/db`
   - Pour persister la base de données SQLite

4. **Déployer**
   - Coolify va automatiquement build et démarrer le conteneur

## 🛠️ Développement local

```bash
# Installer les dépendances
bun install

# Configurer l'environnement
cp .env.example .env

# Initialiser la base de données
bun run db:push
bun run db:seed

# Démarrer le serveur de développement
bun run dev
```

## 📦 Structure du projet

```
├── src/
│   ├── app/                    # Pages Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── admin/             # Interface admin
│   │   ├── je-cherche/        # Formulaire locataire
│   │   ├── je-loue/           # Formulaire propriétaire
│   │   └── annonce/           # Pages détaillées
│   ├── components/            # Composants React
│   └── lib/                   # Utilitaires
├── prisma/                    # Schéma et seed BDD
├── public/                    # Fichiers statiques
├── Dockerfile                 # Image Docker
└── docker-compose.yml         # Orchestration
```

## 🔐 Identifiants par défaut

- **Admin**: `admin@domelia.fr` / `admin123` (à changer en production)

## 📝 Licence

Propriétaire - Tous droits réservés
