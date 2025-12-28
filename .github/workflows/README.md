# GitHub Actions Workflows

Modular CI/CD architecture for Epitrello with reusable actions.

## Directory Structure

```
.github/
├── workflows/
│   ├── backend-ci.yml           # Backend tests (lint, build, unit, integration)
│   ├── frontend-ci.yml          # Frontend tests (lint, build)
│   ├── e2e-tests.yml            # End-to-end tests
│   ├── code-quality.yml         # Code formatting and Prisma validation
│   ├── deploy-staging.yml       # Staging deployment (dev branch)
│   ├── deploy-production.yml    # Production deployment (master branch)
│   ├── docker-build.yml         # Docker image builds
│   └── release.yml              # GitHub releases
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

Validates frontend code quality and builds.

**Triggers:**

- Push to `master`, `dev` branches
- Pull requests to these branches
- Changes in `frontend/` or workflow/action files

**Jobs:**

#### `lint-and-build`

- ESLint code linting
- TypeScript type checking
- Next.js build compilation
- Build artifact archival

#### `unit-tests`

- Unit test execution (if configured)
- Codecov upload

**Commands:**

```bash
pnpm lint
pnpm tsc --noEmit
pnpm build
pnpm test
```

---

### 3. E2E Tests (`e2e-tests.yml`)

End-to-end testing for complete application workflows.

**Triggers:**

- Push to `master`, `dev` branches
- Pull requests
- Manual workflow dispatch

**Jobs:**

#### `backend-e2e`

- Backend end-to-end test suite
- PostgreSQL database service
- Complete environment configuration
- Test results and coverage upload

**Commands:**

```bash
pnpm test:e2e
```

**Note:** Frontend E2E tests awaiting Playwright/Cypress configuration.

---

### 4. Code Quality (`code-quality.yml`)

Checks code formatting and validates Prisma schema.

**Triggers:**

- Push to `master`, `dev` branches
- Pull requests to these branches

**Jobs:**

#### `format-check`

- Prettier format validation

#### `prisma-validate`

- Prisma schema validation

**Commands:**

```bash
pnpm prettier --check .
pnpm prisma validate
```

---

### 5. Deploy Staging (`deploy-staging.yml`)

Automated deployment to staging environment.

**Triggers:**

- Push to `dev` branch
- Manual workflow dispatch

**Jobs:**

1. **`test-backend`** - Run backend tests before deployment
2. **`deploy-backend`** - Backend deployment to staging
3. **`deploy-frontend`** - Frontend deployment to staging
4. **`notify`** - Deployment status notification

**Environment:** `staging`

**Required Secrets:**

- `STAGING_API_URL` - Staging API endpoint URL

**Note:** Deployment steps are placeholders. Configure for your infrastructure.

---

### 6. Deploy Production (`deploy-production.yml`)

Production deployment with full test verification.

**Triggers:**

- Push to `master`/`main` branches
- Version tags (`v*.*.*`)
- Manual dispatch with version input

**Jobs:**

1. **`verify-tests`** - Complete test suite validation
2. **`deploy-backend`** - Production backend deployment
3. **`deploy-frontend`** - Production frontend deployment
4. **`create-release`** - GitHub release creation (tag-triggered only)
5. **`notify`** - Deployment status notification

**Environment:** `production`

**Required Secrets:**

- `PRODUCTION_API_URL` - Production API endpoint URL

**Note:** Deployment steps require configuration for your specific infrastructure.

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

**Deployment:**

- `STAGING_API_URL` - Staging environment API URL
- `PRODUCTION_API_URL` - Production environment API URL
- Additional secrets depending on infrastructure (Docker Hub, AWS, GCP, etc.)

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

## Migration from Legacy Workflows

### Deprecated Workflows

The following workflows are maintained for compatibility but can be removed after complete migration:

- `ci.yml` - Replaced by `backend-ci.yml` + `frontend-ci.yml`
- `tests.yml` - Replaced by `backend-ci.yml`

**Still Active:**

- `code-quality.yml` - Code formatting and Prisma validation
- `docker-build.yml` - Docker image builds
- `release.yml` - GitHub releases (note: `deploy-production.yml` also creates releases)

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
