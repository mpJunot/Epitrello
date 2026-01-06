# CI/CD Setup Guide - GitHub Actions pour Epitrello

Ce guide explique comment configurer le pipeline CI/CD GitHub Actions pour déployer automatiquement Epitrello sur GCP.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Configuration GCP](#configuration-gcp)
4. [Configuration GitHub](#configuration-github)
5. [Workflows Disponibles](#workflows-disponibles)
6. [Premier Déploiement](#premier-déploiement)
7. [Utilisation Quotidienne](#utilisation-quotidienne)

## 🎯 Vue d'ensemble

### Workflows Créés

| Workflow                        | Déclencheur              | Description                                                                |
| ------------------------------- | ------------------------ | -------------------------------------------------------------------------- |
| **deploy.yml**                  | Push sur master/dev      | Déploiement complet (tests + build + deploy) avec détection de changements |
| **terraform-plan.yml**          | Pull Request             | Plan Terraform avec commentaire sur PR                                     |
| **code-quality.yml**            | Push/PR                  | Linting, CodeQL, validation Prisma, review dépendances                     |
| **database-migrations.yml**     | Manuel / Push migrations | Gestion des migrations Prisma                                              |
| **cleanup-cost-management.yml** | Quotidien (2h AM)        | Nettoyage et rapport de coûts                                              |

### Architecture du Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Pipeline                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Push/PR → Detect Changes                                   │
│              │                                               │
│              ├─► Test Backend                               │
│              ├─► Test Frontend                              │
│              ├─► Security Scan                              │
│              ├─► Validate Terraform                         │
│              │                                               │
│              ├─► Build Backend Package                      │
│              ├─► Build Frontend Package                     │
│              │                                               │
│              └─► Deploy to GCP                              │
│                   │                                          │
│                   ├─► Apply Terraform                       │
│                   ├─► Deploy Cloud Functions               │
│                   ├─► Deploy App Engine                     │
│                   ├─► Run Smoke Tests                       │
│                   └─► Notify (Slack/PR Comment)            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Prérequis

### Outils Locaux (pour le premier setup)

- [gcloud CLI](https://cloud.google.com/sdk/docs/install)
- Git
- Un compte GCP avec facturation activée

### Permissions GCP Requises

Votre compte GCP doit avoir ces rôles :

- `roles/owner` (pour le setup initial)
- Ou combinaison de :
  - `roles/iam.serviceAccountAdmin`
  - `roles/resourcemanager.projectIamAdmin`
  - `roles/editor`

## 🌍 Configuration GCP

### 1. Créer un Service Account pour GitHub Actions

```bash
# Variables
export PROJECT_ID="your-project-id"
export SA_NAME="github-actions"
export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Définir le projet
gcloud config set project $PROJECT_ID

# Créer le service account
gcloud iam service-accounts create $SA_NAME \
  --display-name="GitHub Actions Service Account" \
  --description="Service account for GitHub Actions CI/CD"

# Attribuer les rôles nécessaires
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudfunctions.developer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/appengine.appAdmin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudsql.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin"

# Créer et télécharger la clé JSON
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=$SA_EMAIL

echo "✅ Service Account créé avec succès!"
echo "📄 Clé sauvegardée dans: github-actions-key.json"
echo "⚠️  IMPORTANT: Gardez cette clé en sécurité!"
```

### 2. Activer les APIs nécessaires

```bash
gcloud services enable \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  cloudscheduler.googleapis.com \
  secretmanager.googleapis.com \
  vpcaccess.googleapis.com \
  servicenetworking.googleapis.com \
  storage.googleapis.com \
  appengine.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com
```

### 3. Créer un Bucket pour l'État Terraform (Recommandé)

```bash
# Créer le bucket
gsutil mb -p $PROJECT_ID -l europe-west1 gs://${PROJECT_ID}-terraform-state

# Activer le versioning
gsutil versioning set on gs://${PROJECT_ID}-terraform-state

# Configurer le lifecycle
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "numNewerVersions": 10
        }
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://${PROJECT_ID}-terraform-state
rm lifecycle.json

echo "✅ Bucket Terraform state créé!"
```

## 🔐 Configuration GitHub

### 1. Ajouter les Secrets

Allez dans : **Settings → Secrets and variables → Actions → New repository secret**

#### Secrets Requis

| Nom du Secret    | Description                 | Comment l'obtenir                    |
| ---------------- | --------------------------- | ------------------------------------ |
| `GCP_SA_KEY`     | Clé JSON du Service Account | Contenu de `github-actions-key.json` |
| `GCP_PROJECT_ID` | ID du projet GCP            | Votre project ID                     |
| `JWT_SECRET`     | Secret pour JWT             | `openssl rand -base64 32`            |
| `RESEND_API_KEY` | Clé API Resend              | https://resend.com/api-keys          |

#### Secrets Optionnels (OAuth)

| Nom du Secret             | Description                   |
| ------------------------- | ----------------------------- |
| `GOOGLE_CLIENT_ID`        | Google OAuth Client ID        |
| `GOOGLE_CLIENT_SECRET`    | Google OAuth Client Secret    |
| `MICROSOFT_CLIENT_ID`     | Microsoft OAuth Client ID     |
| `MICROSOFT_CLIENT_SECRET` | Microsoft OAuth Client Secret |

### 2. Ajouter les Variables

Allez dans : **Settings → Secrets and variables → Actions → Variables**

| Nom de la Variable  | Valeur par Défaut        | Description                  |
| ------------------- | ------------------------ | ---------------------------- |
| `GCP_REGION`        | `europe-west1`           | Région GCP                   |
| `EMAIL_FROM`        | `noreply@yourdomain.com` | Email expéditeur             |
| `SLACK_WEBHOOK_URL` | (optionnel)              | Pour les notifications Slack |

### 3. Configuration des Environnements

Créez deux environnements dans : **Settings → Environments**

#### Environment: `staging`

- **Deployment branches**: `dev` et `master`
- **Environment secrets**: Aucun (utilise les secrets du repo)

#### Environment: `production`

- **Deployment branches**: `master` uniquement
- **Required reviewers**: Ajoutez des reviewers (recommandé)
- **Environment secrets**: Aucun (utilise les secrets du repo)

## 🚀 Premier Déploiement

### 1. Préparer le Repository

```bash
# Cloner votre repo
git clone https://github.com/votre-username/epitrello.git
cd epitrello

# Copier les workflows
mkdir -p .github/workflows
cp /path/to/workflows/* .github/workflows/

# Commit et push
git add .github/
git commit -m "feat: add GitHub Actions CI/CD"
git push origin master
```

### 2. Configurer le Backend Terraform

Modifiez `terraform/main.tf` pour utiliser le backend GCS :

```hcl
terraform {
  backend "gcs" {
    bucket = "YOUR-PROJECT-ID-terraform-state"
    prefix = "terraform/state"
  }
}
```

### 3. Lancer le Premier Déploiement

#### Option A : Via GitHub Actions (Recommandé)

1. Allez sur **Actions** dans GitHub
2. Sélectionnez **Deploy to GCP**
3. Cliquez sur **Run workflow**
4. Choisissez l'environnement (`dev`)
5. Cliquez **Run workflow**

#### Option B : Manuellement puis CI/CD

```bash
# Premier déploiement manuel
cd terraform
terraform init
terraform plan
terraform apply

# Ensuite, les déploiements suivants seront automatiques via GitHub Actions
```

### 4. Vérifier le Déploiement

Allez sur **Actions** et vérifiez que tous les jobs sont ✅

Les URLs de votre application seront affichées dans les logs du job `deploy-gcp`.

## 📖 Workflows Disponibles

### 1. Deploy to GCP (deploy.yml)

**Déclencheurs :**

- Push sur `master` ou `dev`
- Pull Request
- Manuel (workflow_dispatch) avec choix de l'environnement (staging/production)

**Ce qu'il fait :**

1. Détecte les changements (backend/frontend/terraform)
2. Execute les tests (backend et frontend)
3. Scanne la sécurité avec Trivy
4. Valide Terraform
5. Build les packages
6. Déploie sur GCP
7. Execute les smoke tests
8. Envoie une notification

**Utilisation manuelle :**

```bash
# Via GitHub UI
Actions → Deploy to GCP → Run workflow → Choisir l'environnement

# Via GitHub CLI
gh workflow run deploy.yml -f environment=staging
```

### 2. Terraform Plan (terraform-plan.yml)

**Déclencheurs :**

- Pull Request modifiant des fichiers Terraform

**Ce qu'il fait :**

1. Valide la syntaxe Terraform
2. Execute `terraform plan`
3. Commente la PR avec le plan

**Exemple de commentaire :**

```
#### Terraform Format and Style 🖌 success
#### Terraform Validation 🤖 success
#### Terraform Plan 📖 success

Show Plan
  + resource "google_sql_database_instance" "postgres" {
      ...
  }

Pusher: @username, Action: pull_request
```

### 3. Code Quality (code-quality.yml)

**Déclencheurs :**

- Push sur `master` ou `dev`
- Pull Request

**Ce qu'il fait :**

1. Lint backend (ESLint)
2. Lint frontend (ESLint)
3. Valide le schéma Prisma
4. Execute CodeQL Analysis (JavaScript/TypeScript)
5. Review des dépendances (Dependency Review)

### 4. Database Migrations (database-migrations.yml)

**Déclencheurs :**

- Manuel (workflow_dispatch)
- Push de migrations sur `master`

**Actions disponibles :**

- `status` : Voir le statut des migrations
- `deploy` : Appliquer les migrations
- `reset` : Reset la DB (dev uniquement)

**Utilisation :**

```bash
# Via GitHub UI
Actions → Database Migrations → Run workflow
Environment: dev
Action: deploy

# Via GitHub CLI
gh workflow run database-migrations.yml \
  -f environment=staging \
  -f action=deploy
```

**⚠️ IMPORTANT :**

- Reset est **interdit** en production
- Les migrations sont **automatiquement déployées** lors d'un push sur `master`

### 5. Cleanup & Cost Management (cleanup-cost-management.yml)

**Déclencheurs :**

- Quotidien à 2h AM UTC
- Manuel (workflow_dispatch)

**Ce qu'il fait :**

1. Nettoie les anciennes versions App Engine
2. Nettoie les vieux fichiers Cloud Storage
3. Génère un rapport de coûts
4. Identifie les ressources inutilisées
5. Envoie les recommandations d'optimisation

## 🔄 Utilisation Quotidienne

### Workflow de Développement

```bash
# 1. Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# 2. Faire vos modifications
# ...

# 3. Commit et push
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# 4. Créer une Pull Request
# → GitHub Actions execute automatiquement:
#    - Tests
#    - Linting
#    - Security scan
#    - Terraform plan (si modifs terraform)

# 5. Merger la PR vers dev
# → Déploiement automatique sur staging

# 6. Merger dev vers master
# → Déploiement automatique sur production
```

### Déployer Uniquement le Backend

```bash
# Faire vos modifications dans backend/
git add backend/
git commit -m "fix: correction bug backend"
git push origin master

# GitHub Actions va détecter le changement et déployer uniquement le backend
```

### Déployer Uniquement le Frontend

```bash
# Faire vos modifications dans frontend/
git add frontend/
git commit -m "feat: nouveau composant"
git push origin master

# GitHub Actions va détecter le changement et déployer uniquement le frontend
```

### Faire une Migration de Base de Données

```bash
# 1. Créer la migration localement
cd backend
pnpm prisma migrate dev --name add_user_role

# 2. Commit et push
git add prisma/migrations/
git commit -m "feat: add user role column"
git push origin master

# 3. GitHub Actions va automatiquement:
#    - Détecter la nouvelle migration
#    - Lancer le workflow database-migrations
#    - Appliquer la migration sur Cloud SQL
```

### Rollback en Cas de Problème

#### Rollback Application

```bash
# Via GitHub (le plus simple)
# 1. Aller sur Actions → Deploy to GCP
# 2. Trouver le déploiement précédent qui marchait
# 3. Re-run all jobs

# Via Git
git revert HEAD
git push origin master
# → Déploie la version précédente
```

#### Rollback Base de Données

```bash
# ⚠️ ATTENTION : Difficile à rollback automatiquement
# Il faut créer une nouvelle migration qui annule les changements

# Exemple
cd backend
pnpm prisma migrate dev --name revert_user_role
# Éditer manuellement la migration pour annuler les changements
git add prisma/migrations/
git commit -m "fix: revert user role migration"
git push origin master
```

## 🔍 Monitoring et Debugging

### Voir les Logs d'un Workflow

```bash
# Via GitHub CLI
gh run list
gh run view RUN_ID
gh run view RUN_ID --log

# Via GitHub UI
Actions → Sélectionner le workflow → Voir les logs
```

### Activer le Debug Mode

Ajoutez ces secrets dans GitHub :

- `ACTIONS_STEP_DEBUG` = `true`
- `ACTIONS_RUNNER_DEBUG` = `true`

### Problèmes Courants

#### ❌ "Error: Credentials not found"

**Solution :**
Vérifiez que le secret `GCP_SA_KEY` est bien configuré :

```bash
# Le secret doit contenir tout le contenu du fichier JSON
cat github-actions-key.json
```

#### ❌ "Error: Permission denied"

**Solution :**
Vérifiez les permissions du Service Account :

```bash
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions@*"
```

#### ❌ "Error: Terraform state lock"

**Solution :**

```bash
# Forcer le unlock (utiliser avec précaution!)
cd terraform
terraform force-unlock LOCK_ID
```

#### ❌ Build échoue mais les tests passent localement

**Solution :**

1. Vérifier les variables d'environnement
2. Vérifier les versions Node.js/pnpm
3. Vérifier le cache pnpm

```bash
# Clear cache GitHub Actions
# Settings → Actions → Caches → Delete cache
```

## 📊 Métriques et Reporting

### Badges à Ajouter au README

```markdown
![Deploy](https://github.com/USERNAME/epitrello/workflows/Deploy%20to%20GCP/badge.svg)
![Code Quality](https://github.com/USERNAME/epitrello/workflows/Code%20Quality/badge.svg)
![Terraform](https://github.com/USERNAME/epitrello/workflows/Terraform%20Plan/badge.svg)
```

### Notifications Slack

Pour recevoir des notifications sur Slack :

1. Créer un Incoming Webhook Slack
2. Ajouter la variable `SLACK_WEBHOOK_URL` dans GitHub
3. Les workflows enverront automatiquement des notifications

## 🔒 Sécurité

### Bonnes Pratiques

1. ✅ **Rotation régulière des clés** (tous les 90 jours)
2. ✅ **Review obligatoire pour prod** (environnement protection)
3. ✅ **Secrets chiffrés** (GitHub Secrets)
4. ✅ **Service Account avec permissions minimales**
5. ✅ **Scan de sécurité automatique** (Trivy)
6. ✅ **CodeQL Analysis** (vulnérabilités code)

### Audit des Déploiements

```bash
# Voir l'historique des déploiements
gh run list --workflow=deploy.yml --limit=20

# Voir qui a déclenché un déploiement
gh run view RUN_ID --json headBranch,headSha,actor,conclusion
```

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud GitHub Actions](https://github.com/google-github-actions)
- [Terraform GitHub Actions](https://github.com/hashicorp/setup-terraform)
- [Best Practices CI/CD](https://docs.github.com/en/actions/deployment/about-deployments/about-continuous-deployment)

## 🆘 Support

En cas de problème :

1. Vérifier les logs du workflow
2. Consulter cette documentation
3. Vérifier les secrets/variables GitHub
4. Vérifier les permissions GCP
5. Ouvrir une issue sur le repo

---

**Prêt à déployer ?** 🚀

```bash
git add .github/
git commit -m "feat: add CI/CD with GitHub Actions"
git push origin master
```

Rendez-vous dans **Actions** pour voir votre premier déploiement automatique !
