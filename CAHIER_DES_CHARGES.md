# CAHIER DES CHARGES

## EPITRELLO
### Outil de Gestion de Projet Collaboratif

**Version** : 1.0  
**Date** : Février 2026  
**Statut** : Validation Technique  
**Auteur** : Équipe de Projet

---

## TABLE DES MATIÈRES

1. [Présentation Générale](#1-présentation-générale)
2. [Périmètre du Projet](#2-périmètre-du-projet)
3. [Architecture Globale](#3-architecture-globale)
4. [Backend](#4-backend)
5. [Frontend](#5-frontend)
6. [Base de Données](#6-base-de-données)
7. [Sécurité](#7-sécurité)
8. [Déploiement et Infrastructure](#8-déploiement-et-infrastructure)
9. [Environnements et Configuration](#9-environnements-et-configuration)
10. [Qualité, Tests et Maintenance](#10-qualité-tests-et-maintenance)
11. [Critères de Validation du Projet](#11-critères-de-validation-du-projet)

---

## 1. PRÉSENTATION GÉNÉRALE

### 1.1 Contexte du Projet

Epitrello est un outil web de gestion de projet collaboratif inspiré de la méthodologie Kanban de Toyota. Il permet à des équipes de s'organiser autour de tableaux de bord virtuels, de gérer des tâches et de suivre l'avancement des travaux en temps réel.

Le projet s'adresse aux équipes de travail souhaitant adopter une approche visuelle et itérative de la gestion de projet, comparable aux outils existants tels que Trello ou Jira.

### 1.2 Problématique Adressée

**Problèmes identifiés** :

- Absence d'outil collaboratif unifié et transparent pour la gestion de tâches
- Difficulté à suivre l'avancement des travaux en temps réel au sein d'équipes distribuées
- Nécessité d'une solution open-source et déployable en interne (on-premises)
- Manque de personnalisation des workflows selon les besoins spécifiques des équipes

### 1.3 Objectifs Fonctionnels et Techniques

#### Objectifs Fonctionnels

- Permettre la création et la gestion de tableaux de projet (boards) organisés en listes (lists) et cartes (cards)
- Faciliter la collaboration en temps réel avec notifications et commentaires
- Implémenter un système de rôles et de permissions granulaires (ADMIN, MEMBER, OBSERVER)
- Supporter l'intégration OAuth (Google, Apple, Microsoft, Slack, GitHub)
- Archiver et restaurer les ressources (cartes, listes, tableaux)

#### Objectifs Techniques

- Développer une API GraphQL performante et scalable via NestJS
- Implémenter une interface utilisateur moderne en Next.js avec App Router
- Assurer la persistance des données via PostgreSQL et Prisma ORM
- Fournir une solution conteneurisée (Docker) prête pour le déploiement
- Mettre en place une stratégie d'authentification robuste (JWT + Passport)
- Assurer une couverture de tests minimale de 80% pour les modules critiques

### 1.4 Public Cible

**Utilisateurs primaires** :

- Chefs de projet et responsables d'équipe
- Membres d'équipe travaillant en Agile ou Kanban
- Entreprises cherchant une alternative open-source aux outils SaaS
- Organisations nécessitant une infrastructure on-premises

**Acteurs techniques** :

- Développeurs fullstack (intégration API, déploiement)
- Administrateurs système (infrastructure, CI/CD, déploiement)
- Responsables sécurité (audit, conformité)

---

## 2. PÉRIMÈTRE DU PROJET

### 2.1 Fonctionnalités Incluses

#### 2.1.1 Gestion des Utilisateurs et Authentification

| Fonctionnalité | Description | Priorité |
|---|---|---|
| Inscription utilisateur | Création de compte avec email/mot de passe | P1 |
| Connexion utilisateur | Authentification JWT | P1 |
| Réinitialisation de mot de passe | Envoi de lien via email | P1 |
| Vérification d'email | Confirmation d'adresse email via jeton | P1 |
| OAuth (Google, Apple, Microsoft, Slack, GitHub) | Intégration des fournisseurs d'identité externes | P2 |
| Profil utilisateur | Gestion du profil (avatar, description) | P2 |
| Préférences de notification | Configuration des fréquences d'email | P2 |

#### 2.1.2 Gestion des Workspaces

| Fonctionnalité | Description | Priorité |
|---|---|---|
| Création de workspace | Création d'un espace de travail | P1 |
| Gestion des membres du workspace | Ajout, suppression, gestion des rôles | P1 |
| Invitations aux workspaces | Envoi d'invitations avec contrôle d'accès | P1 |
| Visibilité du workspace | Configuration (PRIVATE, PUBLIC) | P2 |
| Archivage du workspace | Archivage et restauration | P3 |

#### 2.1.3 Gestion des Boards

| Fonctionnalité | Description | Priorité |
|---|---|---|
| Création de board | Création d'un tableau projet | P1 |
| Édition de board | Modification du titre, description, background | P1 |
| Suppression de board | Suppression logique ou archivage | P1 |
| Gestion des membres | Assignation de rôles (ADMIN, MEMBER, OBSERVER) | P1 |
| Visibilité des boards | PRIVATE, WORKSPACE, PUBLIC | P2 |
| Archivage de board | Archivage et restauration | P2 |

#### 2.1.4 Gestion des Lists et Cards

| Fonctionnalité | Description | Priorité |
|---|---|---|
| Création de liste | Création d'une colonne dans un board | P1 |
| Édition de liste | Modification du titre | P1 |
| Suppression de liste | Suppression logique | P1 |
| Réorganisation des listes | Drag & drop ou API de positionnement | P1 |
| Création de carte | Création d'une tâche dans une liste | P1 |
| Édition de carte | Modification titre, description, dates, background | P1 |
| Suppression de carte | Suppression logique ou archivage | P1 |
| Déplacement de carte | Entre listes et réorganisation | P1 |
| Assignation d'utilisateurs | Assignation/suppression d'assignés | P1 |
| Étiquetage de cartes | Application/suppression de labels | P1 |
| Dates sur cartes | Dates de début et d'échéance | P1 |

#### 2.1.5 Fonctionnalités de Contenu

| Fonctionnalité | Description | Priorité |
|---|---|---|
| Commentaires sur cartes | Ajout, édition, suppression de commentaires | P1 |
| Checklists | Listes de contrôle avec items complétables | P2 |
| Pièces jointes | Upload et gestion de fichiers | P2 |
| Étiquettes (Labels) | Création et application de labels colorés | P1 |
| Descriptions enrichies | Support du texte et formatage basique | P1 |

#### 2.1.6 Notifications et Activité

| Fonctionnalité | Description | Priorité |
|---|---|---|
| Notifications en temps réel | Carte assignée, dates d'échéance, commentaire ajouté | P2 |
| Notifications par email | Résumé périodique ou instantané | P2 |
| Journal d'activité | Historique des modifications | P2 |
| Invitations de board/workspace | Notifications d'invitation | P1 |

### 2.2 Fonctionnalités Explicitement Hors Périmètre

| Fonctionnalité | Justification |
|---|---|
| Collaboration temps réel (CRDT) | Complexité élevée ; version initiale avec polling/webhooks |
| Intégration avec Slack/Microsoft Teams | Hors du scope initial ; potential phase 2 |
| Export/Import de données (Trello, Jira) | Phase ultérieure |
| Analytics et reporting avancés | Phase ultérieure |
| Gestion de sprints et burndown charts | Spécifique à Agile ; hors scope Kanban pur |
| Stockage de fichiers illimité | Limitation de taille par fichier et par workspace |
| Application mobile native | Phase ultérieure ; responsive web en priorité |
| Intégration calendrier (ICS) | Phase ultérieure |
| Webhooks et API publique versionnée | Phase ultérieure |

### 2.3 Hypothèses et Contraintes

#### Hypothèses

- **H1** : Les utilisateurs disposent d'une connexion internet stable
- **H2** : Le déploiement se fait sur infrastructure GCP (Terraform)
- **H3** : La scalabilité cible : 1000 utilisateurs actifs simultanés en phase 1
- **H4** : Les données sensibles (mots de passe, tokens) ne sont jamais stockées en clair
- **H5** : Une migration de données existantes ne sera pas nécessaire au lancement

#### Contraintes Techniques

| Contrainte | Description |
|---|---|
| Base de données | PostgreSQL >= 12 |
| Runtime backend | Node.js 20+ |
| Runtime frontend | Node.js 20+ |
| Conteneurisation | Docker >= 20.10, Docker Compose >= 2.0 |
| Navigateurs supportés | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Latence API | < 500ms pour 95% des requêtes (hors uploads) |
| Disponibilité | 99% de disponibilité cible en production |

#### Contraintes Organisationnelles

| Contrainte | Description |
|---|---|
| Licence | MIT (open-source) |
| Langue | Interface en français et anglais (phase 1) |
| Conformité | RGPD (données personnelles) |
| Infrastructure | On-premises ou cloud (GCP) |

---

## 3. ARCHITECTURE GLOBALE

### 3.1 Description du Monorepo

Epitrello est structuré comme un **monorepo** contenant plusieurs composants interdépendants :

```
Epitrello/
├── backend/                    # API GraphQL (NestJS)
├── frontend/                   # Interface web (Next.js)
├── docs/                       # Documentation
├── terraform/                  # Infrastructure (GCP)
├── scripts/                    # Scripts d'automation
├── Makefile                    # Commandes de développement
├── docker-compose.yml          # Orchestration services
├── docker-compose.dev.yml      # Orchestration dev
├── package.json                # Dépendances root
└── .env.example                # Template environnement
```

### 3.2 Séparation des Responsabilités

#### Backend (`/backend`)

**Responsabilités** :

- Exposition d'une API GraphQL unique (`/graphql`)
- Gestion de l'authentification et des permissions
- Logique métier (création/modification de boards, cards, etc.)
- Intégration avec la base de données via Prisma
- Envoi de notifications et emails
- Tests unitaires et E2E

**Structure** :

```
backend/src/
├── modules/              # Modules métier
│   ├── auth/            # Authentification
│   ├── users/           # Gestion utilisateurs
│   ├── workspaces/      # Gestion des workspaces
│   ├── boards/          # Gestion des boards
│   ├── lists/           # Gestion des listes
│   ├── cards/           # Gestion des cartes
│   ├── comments/        # Gestion des commentaires
│   ├── attachments/     # Gestion des pièces jointes
│   ├── labels/          # Gestion des étiquettes
│   ├── notifications/   # Gestion des notifications
│   ├── email/           # Service d'email
│   └── invitations/     # Gestion des invitations
├── common/              # Éléments partagés
│   ├── guards/          # Guards d'authentification
│   ├── decorators/      # Décorateurs personnalisés
│   ├── filters/         # Filtres d'exception
│   └── interceptors/    # Intercepteurs
├── prisma/              # Service Prisma
├── graphql/             # Configuration GraphQL
├── config/              # Configuration applicative
└── main.ts              # Point d'entrée
```

#### Frontend (`/frontend`)

**Responsabilités** :

- Interface utilisateur responsive
- Communication avec l'API GraphQL
- Gestion d'état local (React hooks/Context)
- Authentification côté client (JWT storage)
- Navigation et routing
- Tests unitaires et E2E

**Structure** :

```
frontend/app/
├── (auth)/              # Routes d'authentification (layout)
├── (main)/              # Routes main (dashboard layout)
│   ├── boards/         # Pages des boards
│   ├── workspaces/     # Pages des workspaces
│   ├── cards/          # Pages des cartes
│   ├── invitations/    # Pages des invitations
│   ├── profile/        # Pages du profil
│   ├── settings/       # Pages de paramètres
│   └── activity/       # Pages d'activité
└── api/                 # API routes (optionnelles)

frontend/components/
├── ui/                  # Composants atomiques (shadcn/ui)
├── CardModal/           # Modal de carte
├── ListColumn/          # Colonne de liste
├── BoardView/           # Vue du board
├── Sidebar/             # Barre latérale
├── Topbar/              # Barre supérieure
├── NotificationsDropdown/
└── ...autres composants
```

#### Base de Données (`/backend/prisma`)

**Responsabilités** :

- Définition du schéma de données
- Migrations de base de données
- Client Prisma généré
- Seed de données initiales (optionnel)

#### Documentation (`/docs`)

**Contient** :

- Cahier des charges (ce document)
- Documentation GraphQL (auto-générée par SpectaQL)
- Documentation de déploiement
- Diagrammes d'architecture

### 3.3 Schéma Logique de l'Architecture

#### 3.3.1 Flux d'Authentification

```
┌─────────────┐
│  Frontend   │
│  (Next.js)  │
└──────┬──────┘
       │ 1. Email/password ou OAuth
       ▼
┌─────────────────────────────────┐
│  Backend - Auth Module (NestJS) │
├─────────────────────────────────┤
│ • Validation credentials        │
│ • Génération JWT                │
│ • Stockage hash mot de passe    │
└──────┬──────────────────────────┘
       │ 2. Retour JWT
       ▼
┌──────────────────────────────┐
│  Frontend                    │
│  • Stockage JWT (localStorage│
│    ou cookie sécurisé)       │
│  • Envoi dans Authorization  │
│    Bearer token              │
└──────────────────────────────┘
       │ 3. Requêtes authentifiées
       ▼
┌──────────────────────────────┐
│  Backend - Protected Routes  │
│  • Vérification JWT          │
│  • Extraction user ID        │
│  • Vérification permissions  │
└──────────────────────────────┘
```

#### 3.3.2 Flux de Requête GraphQL

```
┌──────────────────────────────────────┐
│  Frontend (Apollo/URQL Client)       │
│  • Query/Mutation GraphQL            │
│  • Avec JWT en headers               │
└────────────┬─────────────────────────┘
             │
             ▼
    ┌─────────────────────┐
    │  GraphQL Endpoint   │
    │  POST /graphql      │
    └────────┬────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  NestJS Application                  │
├──────────────────────────────────────┤
│ • GqlAuthGuard (vérification JWT)   │
│ • Parsing de la query GraphQL        │
│ • Résolution par Resolvers           │
│ • Appel aux Services métier          │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  Prisma ORM                          │
│  • Construction requête SQL          │
│  • Exécution et cache                │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  PostgreSQL Database                 │
│  • Lecture/Écriture data             │
└──────────────────────────────────────┘
```

#### 3.3.3 Architecture Conteneurisée

```
┌──────────────────────────────────────────────────────────────┐
│                     Docker Compose                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐ │
│  │   Frontend      │  │    Backend      │  │ PostgreSQL │ │
│  │   :3000/tcp     │  │    :4000/tcp    │  │ :5432/tcp  │ │
│  │   (Next.js)     │──│   (NestJS)      │──│  (DB)      │ │
│  │   Node 20       │  │   Node 20       │  │  Ubuntu    │ │
│  └─────────────────┘  └─────────────────┘  └────────────┘ │
│                                                              │
│  Volumes:                                                    │
│  • postgres_data (persistant)                               │
│                                                              │
│  Networks:                                                   │
│  • epitrello_network (bridge)                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3.4 Communication Inter-Composants

| Composant A | Composant B | Protocole | Authentification |
|---|---|---|---|
| Frontend | Backend | GraphQL over HTTP/S | JWT (Bearer) |
| Backend | PostgreSQL | TCP | Username/Password |
| Frontend | Frontend | N/A (Same Origin) | - |
| Backend (optional) | Services externes | HTTP/S | API Key, OAuth |

---

## 4. BACKEND

### 4.1 Stack Technologique

| Composant | Technologie | Version | Justification |
|---|---|---|---|
| Framework | NestJS | 10+ | Architecture modulaire, TypeScript, DI natif |
| API | GraphQL (Apollo Server) | 4+ | Requêtes flexibles, typage fort |
| ORM | Prisma | 7+ | Type-safe, migrations, performance |
| Base de données | PostgreSQL | 12+ | Relationnel, ACID, performance |
| Authentification | Passport.js + JWT | - | Standards JWT, stratégies multiples |
| Validation | class-validator | 0.14+ | Décorateurs, validation metadata |
| Email | Resend | Latest | Service d'email moderne et fiable |
| Tests | Jest | 29+ | Unitaires, intégration, coverage |
| Linting | ESLint | 8+ | Qualité de code |
| Formatage | Prettier | 3+ | Cohérence du code |

### 4.2 Fonctionnalités Détaillées

#### 4.2.1 Module d'Authentification

**Endpoints GraphQL** :

```graphql
mutation {
  signup(input: SignupInput!): AuthResponse!
  signin(input: SigninInput!): AuthResponse!
  refreshToken(token: String!): AuthResponse!
  resetPassword(input: ResetPasswordInput!): Boolean!
  verifyEmail(token: String!): Boolean!
  signoutAll: Boolean!
}

query {
  me: User!
}
```

**Stratégies supportées** :

- JWT (Bearer token via Authorization header)
- OAuth (Google, Apple, Microsoft, Slack, GitHub)
- Passport.js avec stratégies multiples

**Spécifications JWT** :

- **Algoritme** : HS256 (HMAC SHA-256)
- **Expiration** : Configurable (défaut 7 jours)
- **Payload** : `{ sub: userId, email, iat, exp }`
- **Storage Frontend** : localStorage (secure, HttpOnly en production via cookie)

#### 4.2.2 Module Utilisateurs

**Responsabilités** :

- CRUD utilisateurs
- Gestion du profil
- Modification du mot de passe
- Préférences de notification

**Endpoints GraphQL** :

```graphql
query {
  users(filter: UserFilterInput): [User!]!
  user(id: String!): User!
  me: User!
}

mutation {
  updateUser(input: UpdateUserInput!): User!
  deleteUser(id: String!): Boolean!
  updateUserPreferences(input: UpdateUserPreferencesInput!): UserNotificationPreferences!
}
```

#### 4.2.3 Module Workspaces

**Responsabilités** :

- Création/modification/suppression de workspaces
- Gestion des membres du workspace
- Gestion des invitations
- Contrôle d'accès aux workspaces

**Entités et Relations** :

- `Workspace` : Entité principale
- `WorkspaceMember` : Relation many-to-many (User ↔ Workspace) avec rôle
- `WorkspaceInvitation` : Invitations en attente

**Rôles dans Workspace** :

- **ADMIN** : Gestion complète, ajout/suppression de membres
- **MEMBER** : Création de boards, collaboration
- **OBSERVER** : Lecture seule

**Endpoints GraphQL** :

```graphql
query {
  workspaces(filter: WorkspaceFilterInput): [Workspace!]!
  workspace(id: String!): Workspace!
}

mutation {
  createWorkspace(input: CreateWorkspaceInput!): Workspace!
  updateWorkspace(id: String!, input: UpdateWorkspaceInput!): Workspace!
  deleteWorkspace(id: String!): Boolean!
  addMemberToWorkspace(input: AddMemberInput!): WorkspaceMember!
  removeMemberFromWorkspace(workspaceId: String!, userId: String!): Boolean!
  inviteToWorkspace(input: InviteToWorkspaceInput!): WorkspaceInvitation!
}
```

#### 4.2.4 Module Boards

**Responsabilités** :

- CRUD de boards
- Gestion des membres
- Gestion des labels
- Archivage/restauration

**Entités** :

- `Board` : Tableau principal
- `BoardMember` : Relation many-to-many avec rôles
- `Label` : Étiquettes associées au board

**Rôles dans Board** :

- **ADMIN** : Gestion complète
- **MEMBER** : Création de cartes, modification
- **OBSERVER** : Lecture seule

**Endpoints GraphQL** :

```graphql
query {
  boards(filter: BoardFilterInput): [Board!]!
  board(id: String!): Board!
}

mutation {
  createBoard(input: CreateBoardInput!): Board!
  updateBoard(id: String!, input: UpdateBoardInput!): Board!
  deleteBoard(id: String!): Boolean!
  archiveBoard(id: String!): Board!
  restoreBoard(id: String!): Board!
  addMemberToBoard(input: AddBoardMemberInput!): BoardMember!
}
```

#### 4.2.5 Module Lists

**Responsabilités** :

- CRUD de listes
- Gestion du positionnement
- Archivage/restauration

**Entités** :

- `List` : Liste dans un board

**Positionnement** :

- Champ `position: Int` pour l'ordre
- Implémentation du glisser-déposer par mise à jour de position
- Reordering atomique avec transactions

**Endpoints GraphQL** :

```graphql
mutation {
  createList(input: CreateListInput!): List!
  updateList(id: String!, input: UpdateListInput!): List!
  deleteList(id: String!): Boolean!
  moveList(input: MoveListInput!): List!
  archiveList(id: String!): List!
}
```

#### 4.2.6 Module Cards

**Responsabilités** :

- CRUD de cartes
- Assignation d'utilisateurs
- Application de labels
- Gestion des dates
- Archivage/restauration

**Entités** :

- `Card` : Carte/tâche
- `CardAssignee` : Relation many-to-many
- `CardLabel` : Relation many-to-many

**Champs de Carte** :

- `title: String` : Titre (requis)
- `description: String` : Description (optionnel)
- `background: String` : Couleur/image
- `startDate: DateTime` : Date de début
- `dueDate: DateTime` : Date d'échéance
- `completed: Boolean` : État de complétude
- `position: Float` : Position dans la liste

**Endpoints GraphQL** :

```graphql
query {
  cards(filter: CardFilterInput): [Card!]!
  card(id: String!): Card!
}

mutation {
  createCard(input: CreateCardInput!): Card!
  updateCard(id: String!, input: UpdateCardInput!): Card!
  deleteCard(id: String!): Boolean!
  moveCard(input: MoveCardInput!): Card!
  assignUser(input: AssignUserInput!): Card!
  unassignUser(cardId: String!, userId: String!): Card!
  addLabel(input: AddLabelInput!): Card!
  removeLabel(cardId: String!, labelId: String!): Card!
  archiveCard(id: String!): Card!
}
```

#### 4.2.7 Module Comments

**Responsabilités** :

- CRUD de commentaires sur cartes
- Notifications de commentaires

**Entités** :

- `Comment` : Commentaire sur une carte

**Endpoints GraphQL** :

```graphql
query {
  comments(cardId: String!): [Comment!]!
}

mutation {
  addComment(input: AddCommentInput!): Comment!
  updateComment(id: String!, content: String!): Comment!
  deleteComment(id: String!): Boolean!
}
```

#### 4.2.8 Module Attachments

**Responsabilités** :

- Upload de fichiers
- Gestion des métadonnées
- Suppression de fichiers

**Spécifications** :

- **Taille max par fichier** : 25 MB
- **Stockage** : Google Cloud Storage ou local
- **Types supportés** : Images, documents, archives

**Endpoints GraphQL** :

```graphql
mutation {
  uploadAttachment(cardId: String!, file: Upload!): Attachment!
  deleteAttachment(id: String!): Boolean!
}
```

#### 4.2.9 Module Notifications

**Responsabilités** :

- Création de notifications
- Gestion des préférences
- Envoi d'emails

**Types de Notifications** :

- `CARD_ASSIGNED` : Assignation à une carte
- `CARD_DUE_SOON` : Échéance approchant
- `COMMENT_ADDED` : Commentaire ajouté
- `BOARD_INVITATION` : Invitation au board
- `WORKSPACE_INVITATION` : Invitation au workspace

**Fréquences d'Email** :

- `INSTANT` : Immédiat
- `DAILY` : Résumé quotidien
- `NEVER` : Désactivé

**Endpoints GraphQL** :

```graphql
query {
  notifications: [Notification!]!
  unreadNotificationsCount: Int!
}

mutation {
  markAsRead(id: String!): Notification!
  markAllAsRead: Boolean!
}
```

#### 4.2.10 Module Invitations

**Responsabilités** :

- Création et gestion des invitations
- Acceptation/rejet d'invitations
- Envoi de mails

**Statuts d'Invitation** :

- `PENDING` : En attente
- `ACCEPTED` : Acceptée
- `REJECTED` : Rejetée
- `CANCELLED` : Annulée

**Endpoints GraphQL** :

```graphql
mutation {
  acceptInvitation(invitationId: String!): Boolean!
  rejectInvitation(invitationId: String!): Boolean!
  cancelInvitation(invitationId: String!): Boolean!
}
```

### 4.3 Spécifications de l'API GraphQL

#### 4.3.1 Endpoint

- **Méthode** : POST
- **URL** : `/graphql`
- **Content-Type** : `application/json`
- **Port par défaut** : `4000`

#### 4.3.2 Authentification

**Header requis** :

```
Authorization: Bearer <JWT_TOKEN>
```

**Réponses** :

- **200 OK** : Requête valide
- **401 Unauthorized** : Token manquant ou invalide
- **403 Forbidden** : Permissions insuffisantes
- **400 Bad Request** : Query invalide
- **500 Server Error** : Erreur serveur

#### 4.3.3 Format de Réponse

**Succès** :

```json
{
  "data": {
    "query_name": {
      "field1": "value1",
      "field2": "value2"
    }
  }
}
```

**Erreur** :

```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### 4.4 Tests

#### 4.4.1 Stratégie de Tests

| Type | Couverture | Outil | Commande |
|---|---|---|---|
| Unitaires | Services, guards, interceptors | Jest | `pnpm test:unit` |
| Intégration | Interactions modules, DB | Jest + BD test | `pnpm test:integration` |
| E2E | Flow complets utilisateur | Jest + BD test | `pnpm test:e2e` |
| Tous | Combiné avec rapport | Jest | `pnpm test:all:report` |

#### 4.4.2 Seuils de Couverture

**Modules critiques (couverture minimale 80%)** :

- `workspaces.service.ts`
- `invitations.service.ts`
- `email.service.ts`

**Validation CI/CD** : Les seuils sont vérifiés automatiquement via Codecov

#### 4.4.3 Exemple de Test Unitaire

```typescript
describe('BoardsService', () => {
  let service: BoardsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [BoardsService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should create a board', async () => {
    const createBoardInput = { title: 'Test Board' };
    const userId = 'user-123';

    prismaService.board = {
      create: jest.fn().mockResolvedValue({
        id: 'board-123',
        ...createBoardInput,
      }),
    };

    const result = await service.createBoard(createBoardInput, userId);

    expect(result.id).toBe('board-123');
  });
});
```

---

## 5. FRONTEND

### 5.1 Stack Technologique

| Composant | Technologie | Version | Justification |
|---|---|---|---|
| Framework | Next.js | 16+ (App Router) | SSR, SSG, API routes, TypeScript |
| Langage | TypeScript | 5+ | Type-safety, DX améliorée |
| Styling | Tailwind CSS | 4+ | Utility-first, responsive |
| Composants | shadcn/ui | Latest | Composants unstyled et accessibles |
| État | React Context + Hooks | Built-in | Suffisant pour cette échelle |
| GraphQL Client | Apollo Client | 3+ | Caching, mutations, subscriptions |
| Forms | React Hook Form | 7+ | Validation, performance |
| Validation | Zod | 3+ | Type-safe schema validation |
| Build Tool | Next.js Webpack | Built-in | Optimization, code splitting |
| Tests | Vitest + Playwright | Latest | Tests unitaires et E2E |
| Linting | ESLint | 8+ | Qualité de code |
| Formatage | Prettier | 3+ | Cohérence du code |

### 5.2 Structure des Pages

#### 5.2.1 Pages d'Authentification

**Route** : `/auth/*`

**Pages** :

- `/auth/signin` : Connexion
- `/auth/signup` : Inscription
- `/auth/reset-password` : Réinitialisation mot de passe
- `/auth/verify-email` : Vérification email
- `/auth/oauth/callback` : Callback OAuth

**Features** :

- Validation de formulaire côté client
- Gestion des erreurs
- Redirection post-authentification
- Support OAuth

#### 5.2.2 Pages Dashboard

**Route** : `/dashboard`

**Contenu** :

- Liste des workspaces récents
- Boards épinglés
- Activité récente
- Invitations en attente

#### 5.2.3 Pages Workspaces

**Routes** :

- `/workspaces` : Liste des workspaces
- `/workspaces/[id]` : Détails d'un workspace
- `/workspaces/[id]/boards` : Boards du workspace
- `/workspaces/[id]/settings` : Paramètres du workspace
- `/workspaces/[id]/members` : Gestion des membres

#### 5.2.4 Pages Boards

**Routes** :

- `/boards/[id]` : Vue board (Kanban)
  - Affichage des listes et cartes
  - Drag & drop des cartes
  - Création de cartes/listes inline
  - Filtres et recherche

- `/boards/[id]/settings` : Paramètres du board

#### 5.2.5 Pages Cards

**Routes** :

- `/cards/[id]` : Détails de la carte (modal)
  - Titre, description, dates
  - Assignations
  - Commentaires
  - Pièces jointes
  - Checklists
  - Activité

#### 5.2.6 Pages Invitations

**Routes** :

- `/invitations` : Liste des invitations reçues
  - Accepter/rejeter
  - Statut (Pending, Accepted, Rejected)

#### 5.2.7 Pages Profil et Paramètres

**Routes** :

- `/profile` : Profil utilisateur
- `/settings` : Paramètres globaux (notification, thème)

#### 5.2.8 Pages Activité

**Routes** :

- `/activity` : Journal d'activité personnelle
  - Filtrage par type
  - Recherche chronologique

### 5.3 Composants Clés

#### 5.3.1 BoardView

**Responsabilités** :

- Affichage du board en Kanban
- Gestion du drag & drop (cartes entre listes)
- Rendu des listes et cartes
- Filtres et recherche

**Props** :

```typescript
interface BoardViewProps {
  boardId: string;
  readonly?: boolean;
}
```

**Features** :

- Drag & drop avec react-beautiful-dnd ou Dnd Kit
- Virtualisation des listes (pour performance)
- Recherche en temps réel
- Filtres par label, assigné, date

#### 5.3.2 CardModal

**Responsabilités** :

- Affichage détaillé d'une carte
- Édition des propriétés
- Gestion des commentaires
- Gestion des pièces jointes
- Gestion des checklists

**Props** :

```typescript
interface CardModalProps {
  cardId: string;
  onClose: () => void;
  isOpen: boolean;
}
```

**Sections** :

- En-tête (titre, labels)
- Description
- Assignations
- Dates (début, échéance)
- Checklists
- Commentaires
- Pièces jointes
- Activité

#### 5.3.3 Checklist

**Responsabilités** :

- Affichage des items de checklist
- Toggle complétude
- Ajout/suppression d'items
- Barre de progression

**Props** :

```typescript
interface ChecklistProps {
  cardId: string;
  items: ChecklistItem[];
  readOnly?: boolean;
}
```

#### 5.3.4 NotificationsDropdown

**Responsabilités** :

- Affichage des notifications
- Marquer comme lues
- Navigation vers sources
- Badge de compte non-lu

**Features** :

- Dropdown positionné en haut à droite
- Pagination des notifications
- Filtrage par type
- Suppression des notifications anciennes

#### 5.3.5 Sidebar

**Responsabilités** :

- Navigation principale
- Workspace switcher
- Liste des boards/listes rapides
- Collapsible en mobile

**Contenu** :

- Workspaces (avec switch)
- Boards du workspace courant
- Boards épinglés
- Invitations
- Profil utilisateur

#### 5.3.6 Topbar

**Responsabilités** :

- Navigation secondaire
- Recherche globale
- Menu utilisateur
- Theme toggle

**Éléments** :

- Breadcrumb (Workspace > Board > List)
- Barre de recherche
- Bouton ajout rapide (board/carte)
- Notifications bell
- Menu utilisateur (profil, settings, logout)
- Toggle thème clair/sombre

### 5.4 Communication avec l'API

#### 5.4.1 Apollo Client Configuration

```typescript
const apolloClient = new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL,
    credentials: 'include', // Cookies si JWT en HttpOnly
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  }),
  cache: new InMemoryCache(),
});
```

#### 5.4.2 Exemple Query

```typescript
const GET_BOARD = gql`
  query GetBoard($id: String!) {
    board(id: $id) {
      id
      title
      description
      lists {
        id
        title
        position
        cards {
          id
          title
          position
          dueDate
          assignees {
            id
            name
            avatar
          }
        }
      }
    }
  }
`;
```

#### 5.4.3 Exemple Mutation

```typescript
const MOVE_CARD = gql`
  mutation MoveCard($input: MoveCardInput!) {
    moveCard(input: $input) {
      id
      listId
      position
    }
  }
`;
```

### 5.5 Gestion d'État

#### 5.5.1 Authentication Context

Gestion du JWT et de l'utilisateur courant :

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (data: SignupInput) => Promise<void>;
}
```

#### 5.5.2 Board Context

Gestion de l'état du board courant :

```typescript
interface BoardContextType {
  boardId: string;
  board: Board | null;
  lists: List[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}
```

#### 5.5.3 Notification Context

Gestion des notifications utilisateur :

```typescript
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notif: Notification) => void;
  markAsRead: (id: string) => void;
}
```

### 5.6 Responsive Design

**Breakpoints Tailwind** :

- `sm` : 640px (mobile)
- `md` : 768px (tablet)
- `lg` : 1024px (desktop)
- `xl` : 1280px (large desktop)

**Adaptations par device** :

| Écran | Changements |
|---|---|
| Mobile (< 640px) | Sidebar masquée, single column layout |
| Tablet (640-1024px) | Sidebar collapsible, 2-3 colonnes |
| Desktop (> 1024px) | Sidebar visible, full Kanban view |

---

## 6. BASE DE DONNÉES

### 6.1 Technologie

- **SGBDR** : PostgreSQL 12+
- **ORM** : Prisma 7+
- **Migrations** : Gérées par Prisma
- **Connection Pool** : PgBouncer ou connection pooling natif Prisma

### 6.2 Modèles de Données

#### 6.2.1 User

```prisma
model User {
  id                       String    @id @default(uuid())
  email                    String    @unique
  name                     String
  password                 String    // Hash bcrypt
  avatar                   String?
  description              String?
  emailVerified            Boolean   @default(false)
  emailVerificationToken   String?   @unique
  emailVerificationExpires DateTime?
  resetPasswordToken       String?
  resetPasswordExpires     DateTime?
  createdAt                DateTime  @default(now())
  updatedAt                DateTime  @updatedAt

  // Relations
  createdBoards            Board[]   @relation("BoardCreator")
  boardMembers             BoardMember[]
  cardAssignees            CardAssignee[]
  comments                 Comment[]
  attachments              Attachment[]
  workspaceMemberships     WorkspaceMember[]
  notifications            Notification[]
  oauthAccounts            OAuthAccount[]
  sentInvitations          WorkspaceInvitation[] @relation("InvitationInviter")
  receivedInvitations      WorkspaceInvitation[] @relation("InvitationInvitee")
  activities               Activity[]
  notificationPreferences  UserNotificationPreferences?
}
```

#### 6.2.2 Workspace

```prisma
model Workspace {
  id          String     @id @default(uuid())
  name        String
  logoUrl     String?
  description String?
  visibility  Visibility @default(PRIVATE)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relations
  boards      Board[]
  memberships WorkspaceMember[]
  invitations WorkspaceInvitation[]
}
```

#### 6.2.3 Board

```prisma
model Board {
  id          String     @id @default(uuid())
  workspaceId String?
  title       String
  description String?
  visibility  Visibility @default(PRIVATE)
  background  String?
  isArchived  Boolean    @default(false)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relations
  workspace   Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  creatorId   String
  creator     User       @relation("BoardCreator", fields: [creatorId], references: [id], onDelete: Cascade)
  members     BoardMember[]
  lists       List[]
  labels      Label[]
  activities  Activity[]
}
```

#### 6.2.4 BoardMember

```prisma
model BoardMember {
  id       String   @id @default(uuid())
  boardId  String
  userId   String
  role     Role     @default(MEMBER)
  joinedAt DateTime @default(now())

  // Relations
  board    Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([boardId, userId])
}
```

#### 6.2.5 List

```prisma
model List {
  id         String   @id @default(uuid())
  boardId    String
  title      String
  position   Int      @default(0)
  isArchived Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  board      Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  cards      Card[]
}
```

#### 6.2.6 Card

```prisma
model Card {
  id          String    @id @default(uuid())
  listId      String
  title       String
  description String?
  background  String?
  startDate   DateTime?
  dueDate     DateTime?
  position    Float     @default(0)
  completed   Boolean   @default(false)
  isArchived  Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  list        List      @relation(fields: [listId], references: [id], onDelete: Cascade)
  assignees   CardAssignee[]
  comments    Comment[]
  attachments Attachment[]
  checklists  Checklist[]
  labels      CardLabel[]
}
```

#### 6.2.7 Comment

```prisma
model Comment {
  id        String   @id @default(uuid())
  cardId    String
  authorId  String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

#### 6.2.8 Attachment

```prisma
model Attachment {
  id        String   @id @default(uuid())
  cardId    String
  uploaderId String
  url       String
  filename  String
  size      Int      // en bytes
  createdAt DateTime @default(now())

  // Relations
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  uploader  User     @relation(fields: [uploaderId], references: [id], onDelete: Cascade)
}
```

#### 6.2.9 Label

```prisma
model Label {
  id        String   @id @default(uuid())
  boardId   String
  name      String
  color     String   // HEX color
  createdAt DateTime @default(now())

  // Relations
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  cards     CardLabel[]

  @@unique([boardId, name])
}
```

#### 6.2.10 CardLabel

```prisma
model CardLabel {
  id        String   @id @default(uuid())
  cardId    String
  labelId   String
  createdAt DateTime @default(now())

  // Relations
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  label     Label    @relation(fields: [labelId], references: [id], onDelete: Cascade)

  @@unique([cardId, labelId])
}
```

#### 6.2.11 Checklist

```prisma
model Checklist {
  id        String   @id @default(uuid())
  cardId    String
  title     String
  items     ChecklistItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
}

model ChecklistItem {
  id          String    @id @default(uuid())
  checklistId String
  text        String
  completed   Boolean   @default(false)
  position    Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  checklist   Checklist @relation(fields: [checklistId], references: [id], onDelete: Cascade)
}
```

#### 6.2.12 Notification

```prisma
model Notification {
  id        String             @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  data      String?            // JSON stringifiée
  read      Boolean            @default(false)
  createdAt DateTime           @default(now())

  // Relations
  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 6.2.13 WorkspaceMember

```prisma
model WorkspaceMember {
  id          String   @id @default(uuid())
  workspaceId String
  userId      String
  role        Role     @default(MEMBER)
  joinedAt    DateTime @default(now())

  // Relations
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
}
```

#### 6.2.14 WorkspaceInvitation

```prisma
model WorkspaceInvitation {
  id            String             @id @default(uuid())
  workspaceId   String
  inviterId     String
  inviteeEmail  String
  role          Role               @default(MEMBER)
  status        InvitationStatus   @default(PENDING)
  token         String             @unique
  expiresAt     DateTime
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  // Relations
  workspace     Workspace          @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  inviter       User               @relation("InvitationInviter", fields: [inviterId], references: [id], onDelete: Cascade)
  invitee       User?              @relation("InvitationInvitee", fields: [inviteeEmail], references: [email], onDelete: Cascade)
}
```

#### 6.2.15 OAuthAccount

```prisma
model OAuthAccount {
  id        String           @id @default(uuid())
  userId    String
  provider  OAuthProvider
  providerUserId String
  email     String?
  name      String?
  avatar    String?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  // Relations
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerUserId])
}
```

#### 6.2.16 UserNotificationPreferences

```prisma
model UserNotificationPreferences {
  id                      String                    @id @default(uuid())
  userId                  String                    @unique
  emailFrequency          NotificationEmailFrequency @default(PERIODICALLY)
  allowDesktopNotifications Boolean                 @default(false)
  createdAt               DateTime                  @default(now())
  updatedAt               DateTime                  @updatedAt

  // Relations
  user                    User                      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 6.2.17 Activity

```prisma
model Activity {
  id        String       @id @default(uuid())
  boardId   String
  userId    String?
  type      ActivityType
  title     String
  data      String?      // JSON stringifiée
  createdAt DateTime     @default(now())

  // Relations
  board     Board        @relation(fields: [boardId], references: [id], onDelete: Cascade)
  user      User?        @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

### 6.3 Enums

```prisma
enum Visibility {
  PRIVATE      // Accès uniquement aux membres explicites
  WORKSPACE    // Accès à tous les membres du workspace
  PUBLIC       // Accès public (en lecture)
}

enum Role {
  ADMIN        // Gestion complète (membres, paramètres)
  MEMBER       // Création et édition de cartes
  OBSERVER     // Lecture seule
}

enum NotificationType {
  CARD_ASSIGNED
  CARD_DUE_SOON
  COMMENT_ADDED
  BOARD_INVITATION
  WORKSPACE_INVITATION
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
}

enum OAuthProvider {
  GOOGLE
  APPLE
  GITHUB
  MICROSOFT
  SLACK
}

enum NotificationEmailFrequency {
  INSTANT      // Immédiat
  DAILY        // Résumé quotidien
  PERIODICALLY // Résumé hebdomadaire (défaut)
  NEVER        // Désactivé
}

enum ActivityType {
  CARD_CREATED
  CARD_COMPLETED
  CARD_UNCOMPLETED
  CARD_MOVED
  COMMENT_ADDED
  MEMBER_ADDED_TO_CARD
  MEMBER_ADDED_TO_BOARD
  CARD_ARCHIVED
  CARD_UNARCHIVED
  LIST_ARCHIVED
  LIST_UNARCHIVED
  BOARD_ARCHIVED
  BOARD_UNARCHIVED
}
```

### 6.4 Stratégie de Migration

**Outil** : Prisma Migrate

**Commandes** :

```bash
# Créer une migration
pnpm prisma migrate dev --name add_new_field

# Appliquer les migrations en production
pnpm prisma migrate deploy

# Générer le client Prisma
pnpm prisma generate

# Visualiser le schéma
pnpm prisma studio
```

**Versioning** :

Les migrations sont versionnées dans `/backend/prisma/migrations/` avec timestamps.

### 6.5 Performance et Indexation

**Indexes clés** (automatiques ou explicites) :

- `users.email` (UNIQUE)
- `boards.workspaceId`
- `cards.listId`
- `comments.cardId`
- `boardMembers.boardId, userId` (UNIQUE)
- `workspaceMembers.workspaceId, userId` (UNIQUE)

**Requêtes optimisées** :

- N+1 queries évitées via Prisma `include/select`
- Paging pour les listes longues
- Cache Apollo côté client

---

## 7. SÉCURITÉ

### 7.1 Authentification

#### 7.1.1 JWT (JSON Web Tokens)

**Spécifications** :

- **Algorithme** : HS256 (HMAC-SHA256)
- **Clé secrète** : Variable d'environnement `JWT_SECRET` (minimum 32 caractères)
- **Expiration** : `JWT_EXPIRES_IN` (défaut 7 jours)
- **Payload** : 
  ```json
  {
    "sub": "user-uuid",
    "email": "user@example.com",
    "iat": 1234567890,
    "exp": 1234654290
  }
  ```

**Storage Frontend** :

- **Recommandé** : Cookie `HttpOnly`, `Secure`, `SameSite=Strict`
- **Alternative** : localStorage (moins sécurisé contre XSS)

#### 7.1.2 Mot de Passe

**Hachage** :

- **Algorithme** : bcrypt
- **Rounds** : 10+ (défaut)
- **Salt** : Généré automatiquement

**Validation** :

- Longueur minimale : 8 caractères
- Complexité optionnelle : majuscules, chiffres, caractères spéciaux

#### 7.1.3 OAuth 2.0

**Providers supportés** :

- Google
- Apple
- Microsoft
- Slack
- GitHub

**Flow** :

1. Redirection vers provider OAuth
2. Retour avec authorization code
3. Échange du code par un token
4. Création/liaison de compte
5. Génération JWT interne

### 7.2 Autorisation et Contrôle d'Accès

#### 7.2.1 Modèle RBAC (Role-Based Access Control)

**Rôles** :

- **ADMIN** (Board/Workspace)
  - Gestion des membres
  - Édition des paramètres
  - Suppression des ressources
  - Archivage

- **MEMBER** (Board/Workspace)
  - Création de boards/cartes
  - Édition de contenu personnel
  - Collaboration

- **OBSERVER** (Board/Workspace)
  - Lecture seule
  - Pas d'édition

#### 7.2.2 Vérification des Permissions

**Guards GraphQL** :

```typescript
@UseGuards(GqlAuthGuard, BoardOwnerGuard)
@Mutation()
updateBoard(@Args('id') id: string, @Args('input') input: UpdateBoardInput) {
  // Vérifié : authentifié ET propriétaire/admin du board
}
```

**Logique** :

- Chaque requête GraphQL vérifie l'authentification
- Les mutations vérifient les permissions spécifiques
- Les queries appliquent des filtres d'accès

### 7.3 Protection des Endpoints

#### 7.3.1 CORS (Cross-Origin Resource Sharing)

**Configuration** :

```typescript
@Module({
  imports: [
    GraphQLModule.forRoot({
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
      },
    }),
  ],
})
export class AppModule {}
```

#### 7.3.2 Rate Limiting

**Implémentation** :

- Limiter le nombre de requêtes par IP/utilisateur
- Throttle sur endpoints sensibles (login, password reset)

#### 7.3.3 CSRF (Cross-Site Request Forgery)

**Protection** :

- Tokens CSRF dans les formulaires (si applicable)
- SameSite cookies

### 7.4 Données Sensibles

#### 7.4.1 Stockage

**Ne jamais stocker en clair** :

- Mots de passe (toujours hachés)
- Tokens JWT (jamais dans DB)
- Clés API OAuth (toujours chiffrées en transit)

#### 7.4.2 Chiffrement

**En transit** :

- HTTPS obligatoire en production
- TLS 1.2+ obligatoire

**Au repos** :

- Mots de passe : bcrypt
- PII optionnelle : AES-256 (si nécessaire)

#### 7.4.3 Validation des Entrées

**Validation côté serveur** :

- Validation de type TypeScript
- Validation de schéma avec class-validator
- Escape des valeurs en base de données (Prisma)
- Prévention SQL injection

### 7.5 Séparation des Environnements

| Environnement | Détails |
|---|---|
| **Development** | JWT SECRET court, CORS permissif, logs verbeux |
| **Staging** | Configuration production, données test |
| **Production** | JWT SECRET complexe, CORS strict, logs optimisés, HTTPS |

### 7.6 Audit et Logging

**Logs de sécurité** :

- Connexions/déconnexions
- Modifications de permissions
- Accès aux données sensibles
- Tentatives échouées d'authentification

**Rétention** :

- 30 jours minimum en production
- Archivage après 1 an

---

## 8. DÉPLOIEMENT ET INFRASTRUCTURE

### 8.1 Stack de Déploiement

| Composant | Technologie | Détails |
|---|---|---|
| Orchestration | Docker Compose | Local/Staging |
| Conteneurisation | Docker | Images multi-stage |
| Infrastructure | Google Cloud Platform (GCP) | Terraform |
| IaC | Terraform | Modules réutilisables |
| CI/CD | GitHub Actions | Workflows automatisés |
| Registry | Google Container Registry (GCR) | Images Docker |
| Service | Cloud Run / GKE | Hébergement backend/frontend |
| Base de données | Cloud SQL (PostgreSQL) | Managed service |
| Stockage | Google Cloud Storage | Fichiers uploadés |
| Documentation | Cloud Storage + SpectaQL | GraphQL docs publiques |

### 8.2 Docker Compose (Local/Staging)

**Fichiers** :

- `docker-compose.yml` : Configuration principale
- `docker-compose.dev.yml` : Surcharges développement
- `.dockerignore` : Fichiers à exclure

**Services** :

```yaml
services:
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/epitrello
      JWT_SECRET: ${JWT_SECRET}
      PORT: 4000
    depends_on:
      - postgres
    networks:
      - epitrello_network

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:4000/graphql
    depends_on:
      - backend
    networks:
      - epitrello_network

volumes:
  postgres_data:

networks:
  epitrello_network:
    driver: bridge
```

**Commandes** :

```bash
# Démarrer tous les services
docker-compose up -d --build

# Voir les logs
docker-compose logs -f backend

# Arrêter
docker-compose down -v  # -v supprime les volumes
```

### 8.3 Terraform (Infrastructure GCP)

**Structure** :

```
terraform/
├── main.tf              # Configuration principale
├── variables.tf         # Variables
├── outputs.tf           # Outputs
├── providers.tf         # Providers
├── backend.tf           # Cloud Run backend
├── frontend.tf          # Cloud Run frontend
├── database.tf          # Cloud SQL
├── storage.tf           # Cloud Storage
└── modules/
    ├── docs-bucket/     # Module bucket documentation
    └── ...
```

**Modules clés** :

#### 8.3.1 Cloud SQL (PostgreSQL)

```hcl
resource "google_sql_database_instance" "postgres" {
  name = "epitrello-db-${var.environment}"
  database_version = "POSTGRES_15"
  
  settings {
    tier = "db-f1-micro"
    backup_configuration {
      enabled = true
      backup_retention_settings {
        retained_backups = 30
      }
    }
  }
}
```

#### 8.3.2 Cloud Run Backend

```hcl
resource "google_cloud_run_service" "backend" {
  name = "epitrello-backend-${var.environment}"
  location = "europe-west1"
  
  template {
    spec {
      containers {
        image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project}/epitrello/backend:latest"
        env {
          name = "DATABASE_URL"
          value = google_sql_database_instance.postgres.connection_name
        }
      }
    }
  }
}
```

#### 8.3.3 Cloud Run Frontend

```hcl
resource "google_cloud_run_service" "frontend" {
  name = "epitrello-frontend-${var.environment}"
  location = "europe-west1"
  
  template {
    spec {
      containers {
        image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project}/epitrello/frontend:latest"
        env {
          name = "NEXT_PUBLIC_API_URL"
          value = google_cloud_run_service.backend.status[0].url
        }
      }
    }
  }
}
```

#### 8.3.4 Cloud Storage (Documents)

```hcl
resource "google_storage_bucket" "docs" {
  name = "${var.gcp_project}-${var.environment}-epitrello-docs"
  location = "EU"
  
  uniform_bucket_level_access = true
  
  lifecycle_rule {
    condition {
      num_newer_versions = 5
    }
    action {
      type = "Delete"
    }
  }
}
```

### 8.4 CI/CD (GitHub Actions)

**Fichier** : `.github/workflows/deploy.yml`

**Stages** :

1. **Test** : Exécution des tests unitaires et E2E
2. **Build** : Compilation et création des images Docker
3. **Push** : Publication des images dans GCR
4. **Deploy** : Déploiement sur GCP

**Exemple Workflow** :

```yaml
name: Deploy to GCP

on:
  push:
    branches:
      - main
      - dev

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run tests
        run: pnpm test:all:report
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t epitrello-backend:${{ github.sha }} ./backend
          docker build -t epitrello-frontend:${{ github.sha }} ./frontend
      
      - name: Push to GCR
        run: |
          docker push gcr.io/${{ secrets.GCP_PROJECT }}/epitrello-backend:${{ github.sha }}
          docker push gcr.io/${{ secrets.GCP_PROJECT }}/epitrello-frontend:${{ github.sha }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy epitrello-backend \
            --image=gcr.io/${{ secrets.GCP_PROJECT }}/epitrello-backend:${{ github.sha }} \
            --region=europe-west1
```

### 8.5 Stratégie de Déploiement

#### 8.5.1 Développement Local

```bash
# Démarrer les services
make docker-start

# Ou
docker-compose up -d
```

#### 8.5.2 Staging

```bash
# Déployer via Terraform
cd terraform
terraform plan -var-file="env/staging.tfvars"
terraform apply -var-file="env/staging.tfvars"

# Ou via CI/CD
git push origin dev  # Déclenche le workflow GitHub Actions
```

#### 8.5.3 Production

```bash
# Déployer via Terraform
cd terraform
terraform plan -var-file="env/production.tfvars"
terraform apply -var-file="env/production.tfvars"

# Ou via CI/CD
git push origin main  # Déclenche le workflow GitHub Actions
```

### 8.6 Sauvegarde et Récupération

**Sauvegarde** :

- Backups Cloud SQL automatiques (quotidiens)
- Rétention : 30 jours
- Stockage : Multi-région

**Récupération** :

- Restore depuis console GCP
- Point-in-time recovery (5 jours)
- Procedure de DR testée mensuellement

### 8.7 Monitoring et Logging

**Outils** :

- Google Cloud Logging
- Google Cloud Monitoring
- Prometheus (optionnel)
- Grafana (optionnel)

**Métriques** :

- Latence API
- Taux d'erreur
- Utilisation CPU/mémoire
- Connexions DB

---

## 9. ENVIRONNEMENTS ET CONFIGURATION

### 9.1 Variables d'Environnement

**Fichier racine `.env`** (à créer depuis `.env.example`) :

```env
# PostgreSQL Configuration
POSTGRES_USER=epitrello_user
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=epitrello
POSTGRES_PORT=5432

# Database URL
# Pour Docker : postgresql://user:password@postgres:5432/epitrello
# Pour local  : postgresql://user:password@localhost:5432/epitrello
DATABASE_URL="postgresql://epitrello_user:password@postgres:5432/epitrello?schema=public"

# JWT Configuration (SENSITIVE - Change in production!)
JWT_SECRET=your-very-secure-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Backend Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Frontend Configuration
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql

# Email Configuration (Resend)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

**Fichier frontend `frontend/.env.local`** :

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

**Fichier backend `backend/.env`** (en développement local) :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/epitrello?schema=public"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### 9.2 Configurations par Environnement

| Variable | Dev | Staging | Production |
|---|---|---|---|
| `NODE_ENV` | development | production | production |
| `JWT_SECRET` | Court (dev) | Complexe 32+ chars | Complexe 64+ chars |
| `DATABASE_URL` | Local localhost | Cloud SQL | Cloud SQL (sécurisée) |
| `FRONTEND_URL` | http://localhost:3000 | https://staging.epitrello.com | https://epitrello.com |
| `NEXT_PUBLIC_API_URL` | http://localhost:4000/graphql | https://api-staging.epitrello.com/graphql | https://api.epitrello.com/graphql |
| `LOG_LEVEL` | debug | info | warn |
| `CORS_ORIGIN` | * (development) | staging domain | production domain |

### 9.3 Secrets Management

**En production** :

- Utiliser Google Secret Manager
- Rotation des secrets tous les 90 jours
- Audit des accès aux secrets

**Local** :

- `.env` à ne pas commiter
- Template `.env.example` dans le repo

---

## 10. QUALITÉ, TESTS ET MAINTENANCE

### 10.1 Stratégie de Tests

#### 10.1.1 Tests Unitaires

**Couverture** : Services, utils, guards

**Outil** : Jest

**Commande** :

```bash
pnpm test:unit
```

**Exemple** :

```typescript
describe('BoardsService', () => {
  it('should create a board', async () => {
    // Arrange
    const input = { title: 'Test Board' };
    
    // Act
    const result = await service.createBoard(input, userId);
    
    // Assert
    expect(result.id).toBeDefined();
  });
});
```

#### 10.1.2 Tests d'Intégration

**Couverture** : Interactions entre modules, avec BD test

**Outil** : Jest + BD de test

**Commande** :

```bash
pnpm test:integration
```

#### 10.1.3 Tests E2E

**Couverture** : Flows complets utilisateur

**Outils** : Jest (backend), Playwright (frontend)

**Commandes** :

```bash
# Backend E2E
pnpm test:e2e

# Frontend E2E
cd frontend && pnpm test:e2e
```

### 10.2 Seuils de Couverture

**Modules critiques (minimum 80%)** :

- `workspaces.service.ts`
- `invitations.service.ts`
- `email.service.ts`

**Validation** :

- GitHub Actions vérifie les seuils
- Rapport Codecov
- Pull requests bloquées si seuil non atteint

### 10.3 Qualité de Code

#### 10.3.1 Linting

**Outil** : ESLint

**Commandes** :

```bash
pnpm lint              # Tous
pnpm lint:backend      # Backend seulement
pnpm lint:frontend     # Frontend seulement
```

**Règles** :

- TypeScript recommended
- ESLint recommended
- Prettier formatting

#### 10.3.2 Formatage

**Outil** : Prettier

**Commande** :

```bash
pnpm format            # Format tous
pnpm format:check      # Vérifier sans modifier
```

#### 10.3.3 Static Analysis

**Outils recommandés** :

- SonarQube (optionnel)
- Dependabot (dépendances)
- CodeQL (GitHub Advanced Security)

### 10.4 Documentation

#### 10.4.1 Code

- JSDoc/TSDoc pour fonctions publiques
- Commentaires pour logique complexe
- README par module important

#### 10.4.2 API GraphQL

**Auto-généré** :

- SpectaQL génère HTML/Markdown
- Publié sur Cloud Storage
- Mis à jour à chaque déploiement

**Commande** :

```bash
cd backend
pnpm docs:generate
```

#### 10.4.3 Architecture

- [ARCHITECTURE.md](../backend/ARCHITECTURE.md) backend
- Diagrammes (PlantUML)
- Cahier des charges (ce document)

### 10.5 Dépendances et Mise à Jour

**Stratégie** :

- Dependabot enable
- Security patches : appliqués immédiatement
- Minor/Patch : évaluées mensuellement
- Major : évaluées après release notes

**Commandes** :

```bash
# Vérifier les dépendances obsolètes
pnpm outdated

# Mettre à jour
pnpm update
```

### 10.6 Performance

#### 10.6.1 Frontend

**Outils** :

- Lighthouse CI
- Core Web Vitals monitoring

**Cibles** :

- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

#### 10.6.2 Backend

**Outils** :

- APM (GCP Cloud Trace)
- Database query optimization

**Cibles** :

- Query time p95 < 500ms
- API response time p95 < 200ms (sans uploads)

---

## 11. CRITÈRES DE VALIDATION DU PROJET

### 11.1 Critères Fonctionnels

| Critère | Description | Validation |
|---|---|---|
| Authentification | Login/signup, JWT, OAuth | Tests E2E |
| Workspaces | CRUD, gestion membres | Tests E2E |
| Boards | CRUD, visibility, archivage | Tests E2E |
| Lists | CRUD, positionnement | Tests E2E + Drag & drop |
| Cards | CRUD, mouvement, assignation | Tests E2E + Drag & drop |
| Commentaires | CRUD sur cartes | Tests E2E |
| Notifications | Création et consultation | Tests unitaires |
| Permissions | RBAC (ADMIN, MEMBER, OBSERVER) | Tests d'intégration |

### 11.2 Critères Techniques

| Critère | Cible | Validation |
|---|---|---|
| Couverture de tests | 80% sur modules critiques | Codecov report |
| Temps de réponse API | p95 < 500ms | APM monitoring |
| Performance frontend | LCP < 2.5s | Lighthouse CI |
| Disponibilité | 99% uptime | Monitoring alerts |
| Sécurité | HTTPS, JWT, input validation | Security audit |
| CORS | Configuré strictement | Tests CORS |
| Base de données | PostgreSQL 12+, backups | DB health checks |

### 11.3 Critères de Qualité Logicielle

| Critère | Cible | Validation |
|---|---|---|
| Code style | ESLint + Prettier | CI pipeline |
| TypeScript | Strict mode | CI pipeline |
| Documentation | API, README, comments | Review manuel |
| Modularity | Modules découplés | Architecture review |
| Maintenabilité | SOLID principles | Code review |

### 11.4 Critères de Déploiement

| Critère | Cible | Validation |
|---|---|---|
| Docker | Images multi-stage | Build test |
| Docker Compose | Services orchestrés | `docker-compose up` successful |
| Terraform | Infrastructure as Code | `terraform plan` successful |
| CI/CD | Tests, build, deploy automatisés | GitHub Actions workflow |
| Secrets | Pas en clair dans repo | Secret scanning |
| Migrations | Reversibles | Migration testing |

### 11.5 Liste de Contrôle de Livraison

**Code** :

- [ ] Tous les tests passent
- [ ] Couverture minimale atteinte
- [ ] Code linting OK
- [ ] Pas de secrets en dur
- [ ] Documentation complète

**Infra** :

- [ ] Docker Compose fonctionne
- [ ] Terraform plan sans erreur
- [ ] GitHub Actions workflows en place
- [ ] Monitoring configuré
- [ ] Backups testés

**Documentation** :

- [ ] README complets (backend, frontend)
- [ ] DOCKER.md à jour
- [ ] Cahier des charges validé
- [ ] GraphQL docs générées

**Tests** :

- [ ] Unit tests : verts
- [ ] Integration tests : verts
- [ ] E2E tests : verts
- [ ] Couverture rapportée

---

## ANNEXE A : COMMANDES PRINCIPALES

### Commandes Make

```bash
# Setup et installation
make install              # Installer toutes les dépendances
make setup                # Setup complet (install + Prisma)

# Docker
make docker-start         # Démarrer tous les services
make docker-stop          # Arrêter les services
make docker-restart       # Redémarrer les services
make docker-logs          # Voir les logs

# Développement
make dev-backend          # Démarrer backend en dev
make dev-frontend         # Démarrer frontend en dev

# Base de données
make db-up                # Démarrer PostgreSQL
make db-migrate           # Exécuter migrations
make prisma-generate      # Générer Prisma client

# Tests
make test                 # Exécuter tous les tests
make test-backend         # Tests backend uniquement
make lint                 # Linter le code
make format               # Formater le code

# Build
make build-backend        # Build backend
make build-frontend       # Build frontend
```

### Commandes npm/pnpm

**Root** :

```bash
pnpm install              # Installer dépendances root
pnpm test:all:report      # Tests avec rapport
pnpm lint                 # Linter tout
pnpm format               # Formatter tout
```

**Backend** :

```bash
cd backend
pnpm install              # Installer dépendances
pnpm prisma:generate      # Générer Prisma client
pnpm prisma:migrate       # Exécuter migrations
pnpm start:dev            # Démarrer en dev
pnpm build                # Build production
pnpm test:unit            # Tests unitaires
pnpm test:e2e             # Tests E2E
pnpm docs:generate        # Générer docs GraphQL
pnpm lint                 # Linter
pnpm format               # Formatter
```

**Frontend** :

```bash
cd frontend
pnpm install              # Installer dépendances
pnpm dev                  # Démarrer en dev
pnpm build                # Build production
pnpm start                # Démarrer production
pnpm test                 # Tests
pnpm lint                 # Linter
pnpm format               # Formatter
```

---

## ANNEXE B : RÉFÉRENCES

- [NestJS Documentation](https://docs.nestjs.com/)
- [GraphQL Official](https://graphql.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [JWT.io](https://jwt.io/)

---

## ANNEXE C : GLOSSAIRE

| Terme | Définition |
|---|---|
| **API** | Interface de Programmation Applicative |
| **RBAC** | Role-Based Access Control (Contrôle d'accès basé sur les rôles) |
| **JWT** | JSON Web Token |
| **GraphQL** | Langage de requête pour APIs |
| **ORM** | Object-Relational Mapping |
| **CORS** | Cross-Origin Resource Sharing |
| **IaC** | Infrastructure as Code |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **E2E** | End-to-End |
| **CRUD** | Create, Read, Update, Delete |
| **SSR** | Server-Side Rendering |
| **SSG** | Static Site Generation |
| **DX** | Developer Experience |
| **PII** | Personally Identifiable Information (Données personnelles) |
| **RGPD** | Règlement Général sur la Protection des Données |

---

**Document signé le** : Février 2026  
**Version** : 1.0  
**Statut** : Approuvé ✓

---

*Fin du cahier des charges*
