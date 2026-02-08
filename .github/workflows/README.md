# GitHub Actions Workflows

Modular CI/CD architecture for Epitrello with reusable actions.

## Directory Structure

```
.github/
├── workflows/
│   ├── deploy.yml               # Unified deployment (staging/production) with Terraform
│   ├── backend-ci.yml           # Backend tests (lint, build, unit, integration)
│   ├── frontend-ci.yml          # Frontend tests (lint, build, E2E Playwright)
│   ├── code-quality.yml         # Code quality (lint, CodeQL, Prisma validation)
│   ├── database-migrations.yml  # Database migrations management
│   └── cleanup-cost-management.yml # Cost optimization and cleanup
└── actions/
    ├── setup-backend/           # Reusable: Backend setup with DB
    │   └── action.yml
    └── setup-frontend/          # Reusable: Frontend setup
        └── action.yml
```

**Note:** Old monolithic workflows (`ci.yml` and `tests.yml`) have been replaced.

## Workflows

### 1. Backend CI (`backend-ci.yml`)

Runs comprehensive backend testing suite.

**Triggers:**

- Push to `master`, `dev` branches
- Pull requests to these branches
- Changes in `backend/` or workflow/action files

**Jobs:**

#### `backend-tests`

Single job that runs sequentially:

- Lint with ESLint
- Build with NestJS
- Unit tests with coverage (80% threshold for critical modules)
- Coverage report generation
- Codecov upload

#### `integration-tests`

- Integration test suite
- Requires `backend-tests` success
- PostgreSQL database service

**Commands:**

```bash
pnpm lint
pnpm build
pnpm test:unit:cov
pnpm test:integration
```

**Note:** Lint and build run in the same job as unit tests to share PostgreSQL service.

---

### 2. Frontend CI (`frontend-ci.yml`)

Validates frontend code quality, builds, and runs E2E tests.

**Triggers:**

- Push to `master`, `dev` branches
- Pull requests to these branches
- Changes in `frontend/` or workflow/action files

**Jobs:**

#### `lint-and-build`

- ESLint code linting
- TypeScript type checking
- Next.js build compilation
- Build artifact archival (optional)

#### `e2e-tests`

- PostgreSQL + backend + frontend services
- Playwright E2E tests
- Upload Playwright report (artifact)

**Commands:**

```bash
pnpm lint
pnpm tsc --noEmit
pnpm build
pnpm test:e2e   # in e2e-tests job
```

---

### 3. E2E Tests (in Frontend CI)

Frontend E2E tests (Playwright) run as part of the **Frontend CI** workflow (`frontend-ci.yml`), in the `e2e-tests` job.

**Triggers:** Same as Frontend CI (changes in `frontend/`, etc.)

**Job `e2e-tests`:**

- PostgreSQL service, migrations, backend and frontend build
- Start backend (port 4000) and frontend (port 3000)
- Run Playwright: `pnpm test:e2e`
- Upload Playwright report as artifact (on success or failure)

---

### 4. Code Quality (`code-quality.yml`)

Prisma validation, CodeQL security analysis, and dependency review (lint runs in backend-ci / frontend-ci).

**Triggers:**

- Push to `master`, `dev` branches
- Pull requests to these branches

**Jobs:**

1. **`prisma-validate`** - Prisma schema validation
2. **`codeql-analysis`** - CodeQL security analysis (JavaScript/TypeScript)
3. **`dependency-review`** - Dependency vulnerability review (PRs only)

**Note:** Lint runs in `backend-ci.yml` and `frontend-ci.yml`; not duplicated here.

**Commands:**

```bash
pnpm prisma validate   # prisma-validate job
```

---

### 5. Deploy to GCP (`deploy.yml`)

Unified deployment workflow for staging and production with automatic change detection.

**Triggers:**

- Push to `master` (production) or `dev` (staging) branches
- Pull requests
- Manual workflow dispatch with environment selection

**Features:**

- Automatic change detection (backend/frontend/terraform)
- Tests run in dedicated CI workflows (backend-ci, frontend-ci); deploy relies on branch protection
- Security scanning with Trivy
- Terraform validation and deployment
- Docker image build and push to GCR
- Cloud Run (backend and frontend) deployment
- Smoke tests after deployment

**Jobs:**

1. **`detect-changes`** - Detect what changed (backend/frontend/terraform)
2. **`security-scan`** - Trivy vulnerability scanner
3. **`terraform-validate`** - Validate Terraform configuration
4. **`build-backend`** - Build and push Docker image to GCR
5. **`build-frontend`** - Build frontend Docker image (build inside image via Dockerfile)
6. **`terraform-plan`** - Generate Terraform plan (state prefix `terraform/state/<environment>`)
7. **`terraform-apply`** - Apply Terraform changes (staging and production use **separate state files**, so production creates its own DB and resources without replacing staging)
8. **`deploy-backend`** - Deploy to Cloud Run
9. **`deploy-frontend`** - Deploy to Cloud Run
10. **`smoke-tests`** - Run smoke tests
11. **`notify`** - Deployment status notification

**Note:** Backend and frontend tests run in `backend-ci.yml` and `frontend-ci.yml` (path-filtered). Deploy does not re-run them; rely on branch protection requiring those checks to pass before merge.

**Environments:**

- `staging` - Automatic on `dev` branch
- `production` - Automatic on `master` branch

**Required Secrets:**

- `GCP_SERVICE_ACCOUNT` - GCP Service Account email (for Workload Identity Federation)
- `GCP_WORKLOAD_IDENTITY_PROVIDER` - Workload Identity Provider resource name
- `GCP_PROJECT_ID` - GCP Project ID
- `STAGING_API_URL` / `PRODUCTION_API_URL` - API URLs

---

### 6. Terraform Plan (`terraform-plan.yml`)

Automated Terraform plan on pull requests with PR comments.

**Triggers:**

- Pull requests modifying Terraform files

**Jobs:**

1. **`terraform-plan`** - Format check, validation, and plan
2. Comments PR with Terraform plan output

---

### 7. Database Migrations (`database-migrations.yml`)

Automated Prisma database migration management.

**Triggers:**

- Push of migrations to `master` branch
- Manual workflow dispatch

**Actions:**

- `status` - Check migration status
- `deploy` - Apply migrations
- `reset` - Reset database (staging only)

**Environments:**

- `staging` - Automatic on push
- `production` - Manual only

---

### 8. Cleanup & Cost Management (`cleanup-cost-management.yml`)

Automated cost optimization and resource cleanup.

**Triggers:**

- Daily at 2 AM UTC
- Manual workflow dispatch

**Jobs:**

1. **`cleanup-storage`** - Delete old Cloud Storage objects
2. **`cost-report`** - Generate cost report
3. **`identify-unused-resources`** - Identify unused resources
4. **`notify`** - Send notification

---

## Reusable Actions

### Setup Backend (`actions/setup-backend/action.yml`)

Composite action for backend environment configuration.

**Inputs:**

- `node-version` (default: `20`) - Node.js version
- `pnpm-version` (default: `9`) - pnpm version
- `working-directory` (default: `backend`) - Backend directory path

**Steps:**

1. Install pnpm
2. Setup Node.js with dependency caching
3. Install project dependencies
4. Generate Prisma Client
5. Execute database migrations

**Usage:**

```yaml
- name: Setup Backend
  uses: ./.github/actions/setup-backend
  with:
    node-version: '20'
    pnpm-version: '9'
```

---

### Setup Frontend (`actions/setup-frontend/action.yml`)

Composite action for frontend environment configuration.

**Inputs:**

- `node-version` (default: `20`) - Node.js version
- `pnpm-version` (default: `9`) - pnpm version
- `working-directory` (default: `frontend`) - Frontend directory path

**Steps:**

1. Install pnpm
2. Setup Node.js with dependency caching
3. Install project dependencies

**Usage:**

```yaml
- name: Setup Frontend
  uses: ./.github/actions/setup-frontend
  with:
    node-version: '20'
```

---

## Test Coverage

### Minimum Thresholds (80%)

The following modules must maintain minimum 80% test coverage:

| Module          | File                     | Workflow         |
| --------------- | ------------------------ | ---------------- |
| **Workspaces**  | `workspaces.service.ts`  | `backend-ci.yml` |
| **Invitations** | `invitations.service.ts` | `backend-ci.yml` |
| **Email**       | `email.service.ts`       | `backend-ci.yml` |

### Reporting

- **Codecov** - Automatic integration with upload
- **GitHub Summary** - Coverage table in Actions tab
- **Artifacts** - Complete reports available for 30 days

---

## Configuration

### GitHub Secrets

Configure the following secrets in repository settings:

**Backend:**

- `CODECOV_TOKEN` - Codecov upload token
- `RESEND_API_KEY` - Resend API key for email service (E2E tests)

**Deployment (GCP):**

- `GCP_SERVICE_ACCOUNT` - GCP Service Account email (for Workload Identity Federation)
- `GCP_WORKLOAD_IDENTITY_PROVIDER` - Workload Identity Provider resource name
- `GCP_PROJECT_ID` - GCP Project ID
- `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Cloud SQL database name, user, and password (used by run-migrations; must match Terraform)
- `STAGING_API_URL` - Staging environment API URL
- `PRODUCTION_API_URL` - Production environment API URL
- `OAUTH_GITHUB_CLIENT_ID` / `OAUTH_GITHUB_CLIENT_SECRET` - GitHub OAuth (optional; do not use `GITHUB_` prefix, reserved by GitHub)

**GCP IAM for migrations:** The service account in `GCP_SERVICE_ACCOUNT` must have **`roles/cloudsql.viewer`** (or `roles/cloudsql.admin`) on the project so the run-migrations action can read the Cloud SQL instance (public IP). It also needs **`roles/secretmanager.secretAccessor`** on the DB password secret (or use `DB_PASSWORD` from GitHub secrets).

**Location:** `Settings > Secrets and variables > Actions`

---

## Backend Test Commands

Complete test suite commands available in backend:

```bash
# Unit tests
pnpm test:unit              # Run unit tests only
pnpm test:unit:cov          # Run unit tests with coverage

# Integration tests
pnpm test:integration       # Run integration tests

# E2E tests
pnpm test:e2e              # Run end-to-end tests

# All tests
pnpm test:all              # Run all test types sequentially
pnpm test:all:report       # Run all tests with formatted report
```

### Command Details

| Command            | Description               | Test Files                 |
| ------------------ | ------------------------- | -------------------------- |
| `test:unit`        | Unit tests only           | `*.spec.ts` in `src/`      |
| `test:unit:cov`    | Unit tests with coverage  | `*.spec.ts` in `src/`      |
| `test:integration` | Integration tests         | Specific E2E tests         |
| `test:e2e`         | All end-to-end tests      | `*.e2e-spec.ts` in `test/` |
| `test:all`         | Sequential test execution | All test files             |

---

## Workflow Architecture

### Unified Deployment

The `deploy.yml` workflow replaces the following legacy workflows:

- `deploy-staging.yml` - Merged into `deploy.yml`
- `deploy-production.yml` - Merged into `deploy.yml`
- `terraform-staging.yml` - Merged into `deploy.yml`
- `terraform-production.yml` - Merged into `deploy.yml`
- `docker-build.yml` - Merged into `deploy.yml` (GCR only)
- `release.yml` - Can be added to `deploy.yml` if needed

### Current Workflow Structure

All workflows are now modular and focused on specific responsibilities:

- **Testing**: `backend-ci.yml`, `frontend-ci.yml`, `e2e-tests.yml`
- **Quality**: `code-quality.yml`
- **Infrastructure**: `deploy.yml`, `terraform-plan.yml`
- **Database**: `database-migrations.yml`
- **Maintenance**: `cleanup-cost-management.yml`

### Migration Steps

1. Create reusable actions (completed)
2. Create new workflow files (completed)
3. Test new workflows in feature branches
4. Remove legacy `ci.yml` and `tests.yml` after validation
5. Update README badges

---

## Architecture Benefits

### Modularity

- Shared reusable actions
- Workflows separated by responsibility
- Easy maintenance and extension

### Performance

- Parallel job execution when possible
- Optimized caching (pnpm, Node.js)
- Targeted tests based on file changes

### Clarity

- Explicit naming conventions
- Single responsibility per workflow
- Integrated documentation

### Flexibility

- Manual dispatch for deployments
- Separate staging/production environments
- Centralized configuration in actions

---

## Troubleshooting

### Tests fail locally but pass in CI

Ensure version consistency:

```bash
node -v  # Should be 20
pnpm -v  # Should be 9

# Regenerate Prisma Client
pnpm prisma generate
```

### Reusable actions not found

Custom actions must be in the same repository:

```yaml
uses: ./.github/actions/setup-backend  # Correct
uses: ./actions/setup-backend          # Incorrect
```

### Database unavailable

Verify PostgreSQL service health check:

```yaml
services:
  postgres:
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
```

---

## Contributing

To add or modify workflows:

1. Create feature branch
2. Modify workflow files
3. Test using `workflow_dispatch` if available
4. Create pull request with detailed description
5. Ensure all checks pass before merging

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Creating Composite Actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)

---

## License

[MIT](../../LICENSE)
