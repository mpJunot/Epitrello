# GitHub Actions Workflows

This directory contains CI/CD workflows for the Epitrello project.

## Workflows

### 1. CI (`ci.yml`)

Runs on every push and pull request to main branches.

**Backend:**

- Installs dependencies
- Generates Prisma Client
- Runs database migrations
- Lints code
- Builds the application
- Runs unit tests
- Runs E2E tests

**Frontend:**

- Installs dependencies
- Lints code
- Builds the application

### 2. Docker Build (`docker-build.yml`)

Builds and pushes Docker images to Docker Hub.

**Triggers:**

- Push to `master` or `main` branch
- Push of version tags (`v*`)
- Manual workflow dispatch

**Images:**

- `epitrello-backend`
- `epitrello-frontend`

**Configuration:**
Set the following secrets in GitHub:

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password or access token

### 3. Code Quality (`code-quality.yml`)

Checks code formatting and validates Prisma schema.

**Checks:**

- Code formatting (Prettier)
- Prisma schema validation

### 4. Release (`release.yml`)

Creates a GitHub release when a version tag is pushed.

**Trigger:**

- Push of tags matching `v*.*.*` (e.g., `v1.0.0`)

## Configuration

### Test Environment Variables

Test environment variables are defined at the job level in workflow files. No configuration required - workflows work out of the box.

### GitHub Secrets (Optional)

For Docker Hub integration, add these secrets in **Settings** > **Secrets and variables** > **Actions**:

- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub password or access token

**Note**: Without these secrets, workflows will build images but won't push them to Docker Hub.

## Workflow Status Badge

Add this to your README.md to show workflow status:

```markdown
![CI](https://github.com/mpjunot/epitrello/workflows/CI/badge.svg)
```
