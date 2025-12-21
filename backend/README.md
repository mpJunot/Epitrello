# Epitrello Backend

Backend API pour Epitrello, construit avec NestJS, GraphQL et Prisma.

## 🚀 Installation

```bash
# Installer les dépendances
pnpm install

# Générer le client Prisma
pnpm prisma:generate

# Lancer les migrations
pnpm prisma:migrate
```

## 🧪 Tests

### Tests Unitaires

Teste les services, resolvers et utilitaires de manière isolée :

```bash
# Lancer les tests unitaires
pnpm test:unit

# Avec couverture
pnpm test:unit:cov
```

### Tests d'Intégration

Teste les interactions entre modules (E2E spécifiques) :

```bash
pnpm test:integration
```

### Tests E2E (End-to-End)

Teste l'application complète avec base de données :

```bash
pnpm test:e2e
```

### Tous les Tests

Lancer tous les types de tests séquentiellement avec rapport détaillé :

```bash
# Version simple
pnpm test:all

# Version avec rapport formaté
pnpm test:all:report
```

### Autres Commandes de Test

```bash
# Tous les tests (unitaires + E2E)
pnpm test

# Tests avec couverture
pnpm test:cov

# Mode watch
pnpm test:watch

# Mode debug
pnpm test:debug
```

## 📊 Couverture des Tests

Les modules suivants ont un seuil de couverture minimum de **80%** :

- **Workspaces** (`workspaces.service.ts`)
- **Invitations** (`invitations.service.ts`)
- **Email** (`email.service.ts`)

La couverture est automatiquement vérifiée dans les pipelines CI/CD.

## 🏗️ Développement

```bash
# Mode développement (watch)
pnpm start:dev

# Mode debug
pnpm start:debug

# Lint et format
pnpm lint
pnpm format

# Build
pnpm build

# Production
pnpm start:prod
```

## 🗄️ Base de Données

```bash
# Générer le client Prisma
pnpm prisma:generate

# Créer une migration
pnpm prisma:migrate

# Ouvrir Prisma Studio
pnpm prisma:studio
```

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - Structure du projet
- [API Documentation](../docs/API.md) - Documentation GraphQL complète
- [Strategies Analysis](./src/modules/auth/STRATEGIES_ANALYSIS.md) - Analyse des stratégies OAuth

## 🔐 Variables d'Environnement

Copiez `.env.example` vers `.env` et configurez :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/epitrello"

# JWT
JWT_SECRET="your-secret-key"

# Email (Resend)
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="noreply@epitrello.com"

# Frontend
FRONTEND_URL="http://localhost:3000"

# OAuth (optionnel)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 🐳 Docker

```bash
# Démarrer la base de données
docker-compose up -d postgres

# Démarrer tous les services
docker-compose up -d
```

## 📝 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `pnpm start:dev` | Lancer en mode développement |
| `pnpm build` | Build l'application |
| `pnpm test` | Lancer tous les tests |
| `pnpm test:unit` | Tests unitaires uniquement |
| `pnpm test:unit:cov` | Tests unitaires avec couverture |
| `pnpm test:integration` | Tests d'intégration |
| `pnpm test:e2e` | Tests E2E |
| `pnpm test:all:report` | Tous les tests avec rapport |
| `pnpm lint` | Lint le code |
| `pnpm format` | Format le code |
| `pnpm prisma:generate` | Générer le client Prisma |
| `pnpm prisma:migrate` | Lancer les migrations |
| `pnpm prisma:studio` | Ouvrir Prisma Studio |

## 🏗️ Architecture

```
backend/
├── prisma/              # Schéma et migrations Prisma
├── scripts/             # Scripts utilitaires
├── src/
│   ├── common/          # Décorateurs, guards, filtres
│   ├── config/          # Configuration (JWT, DB, etc.)
│   ├── modules/
│   │   ├── auth/        # Authentification & OAuth
│   │   ├── email/       # Service d'email
│   │   ├── invitations/ # Invitations workspace
│   │   ├── users/       # Gestion utilisateurs
│   │   └── workspaces/  # Gestion workspaces
│   ├── prisma/          # Module Prisma
│   └── graphql/         # Schéma GraphQL généré
└── test/                # Tests E2E
```

## 🔧 Technologies

- **Framework** : NestJS
- **API** : GraphQL (Apollo)
- **ORM** : Prisma
- **Base de données** : PostgreSQL
- **Authentication** : JWT + Passport
- **Email** : Resend
- **Tests** : Jest
- **Validation** : class-validator
- **TypeScript** : Full TypeScript support

## 📦 Modules Principaux

### Auth
- Inscription/Connexion
- JWT Authentication
- OAuth (Google, Microsoft, Apple, Slack)
- Réinitialisation mot de passe
- Vérification email

### Workspaces
- CRUD complet
- Gestion des rôles (ADMIN, MEMBER, OBSERVER)
- Permissions basées sur les rôles

### Invitations
- Inviter des membres
- Accepter/Rejeter invitations
- Gestion des rôles
- Emails d'invitation

### Email
- Templates HTML professionnels
- Email de vérification
- Email de bienvenue
- Email d'invitation workspace
- Email de réinitialisation mot de passe

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

[MIT](../LICENSE)
