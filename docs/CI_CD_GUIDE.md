# CI/CD Guide for Epitrello

This document provides a comprehensive overview of the Continuous Integration and Continuous Deployment (CI/CD) setup for the Epitrello project.

## Table of Contents

1. [Overview](#overview)
2. [Workflows](#workflows)
3. [Branch Strategy](#branch-strategy)
4. [Security](#security)
5. [Deployment](#deployment)
6. [Maintenance](#maintenance)
7. [Troubleshooting](#troubleshooting)

## Overview

Epitrello uses GitHub Actions for CI/CD automation. The setup includes:

- **Continuous Integration**: Automated testing, linting, and building on every push/PR
- **Security Scanning**: CodeQL analysis and dependency vulnerability checks
- **Continuous Deployment**: Automated deployments to staging and production
- **Release Management**: Automated changelog generation and release creation
- **Quality Gates**: PR validation, size labeling, and branch name checking

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual trigger via workflow_dispatch

**Jobs:**

#### Lint Job
- Runs ESLint to check code quality
- Enforces coding standards
- **Node Version**: 20
- **Steps**: Checkout → Setup Node → Install deps → Lint

#### Build Job
- Builds the application
- Uploads build artifacts for later use
- **Node Version**: 20
- **Artifacts**: `dist/` and `build/` directories
- **Retention**: 7 days

#### Test Job
- Runs tests on multiple Node.js versions
- Generates code coverage reports
- Uploads coverage to Codecov
- **Node Versions**: 18, 20, 22
- **Matrix Strategy**: Parallel execution across versions

#### Code Quality Job
- Type checking with TypeScript
- Code formatting verification
- **Node Version**: 20

**Configuration:**
```yaml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
```

### 2. CodeQL Security Scan (`codeql.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Weekly schedule (Mondays at midnight)
- Manual trigger

**Features:**
- Scans JavaScript/TypeScript code for security vulnerabilities
- Uses extended security queries
- Automatically creates security alerts
- **Languages**: JavaScript
- **Query Packs**: security-extended, security-and-quality

**Permissions Required:**
- `actions: read`
- `contents: read`
- `security-events: write`

### 3. Dependency Review (`dependency-review.yml`)

**Triggers:**
- Pull requests to `main` or `develop`

**Features:**
- Checks for vulnerable dependencies
- Comments on PRs with findings
- Fails on moderate+ severity vulnerabilities
- **Fail Threshold**: Moderate severity
- **Auto Comment**: Always on PRs

### 4. CD Workflow (`cd.yml`)

**Triggers:**
- Push to `main` branch (staging)
- Tags matching `v*.*.*` pattern (production)
- Manual trigger

**Jobs:**

#### Deploy to Staging
- **When**: Push to `main` branch
- **Environment**: staging
- **URL**: https://staging.epitrello.example.com (placeholder)
- **Steps**: Build → Test → Deploy

#### Deploy to Production
- **When**: Version tags (e.g., v1.0.0)
- **Environment**: production
- **URL**: https://epitrello.example.com (placeholder)
- **Steps**: Build → Test → Deploy → Create Release

#### Docker Build
- Builds and pushes Docker images
- **Tags**: branch name, semver, commit SHA
- **Registry**: Docker Hub (requires credentials)
- **Cache**: GitHub Actions cache

**Required Secrets:**
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password/token
- `GITHUB_TOKEN`: Automatically provided

### 5. PR Checks (`pr-checks.yml`)

**Triggers:**
- PR opened, synchronized, reopened, or edited

**Jobs:**

#### Validate PR
- Checks PR title format (Conventional Commits)
- Detects merge conflicts
- Validates branch naming convention

**Valid PR Title Types:**
- feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

**Valid Branch Prefixes:**
- feature/, bugfix/, hotfix/, release/, docs/, refactor/, test/, chore/

#### PR Size Labeling
- Automatically adds size labels
- **Labels**:
  - `size/xs`: ≤10 lines
  - `size/s`: ≤100 lines
  - `size/m`: ≤500 lines
  - `size/l`: ≤1000 lines
  - `size/xl`: >1000 lines

### 6. Release Workflow (`release.yml`)

**Triggers:**
- Tags matching `v*.*.*`
- Manual trigger with version input

**Features:**
- Generates changelog from commits
- Creates GitHub release
- Uploads build artifacts
- Publishes to npm (if configured)

**Required Secrets:**
- `NPM_TOKEN`: npm authentication token (optional)

### 7. Stale Management (`stale.yml`)

**Schedule:**
- Daily at midnight UTC

**Configuration:**
- **Issues**:
  - Marked stale after: 60 days
  - Closed after: 7 days (if stale)
  - Exempt labels: pinned, security, priority
- **PRs**:
  - Marked stale after: 45 days
  - Closed after: 14 days (if stale)
  - Exempt labels: pinned, security, priority, work-in-progress

### 8. Auto Label (`auto-label.yml`)

**Triggers:**
- Issues opened or edited
- PRs opened, edited, or synchronized

**Features:**
- Auto-labels issues based on title
- Auto-labels PRs based on changed files
- Uses `.github/labeler.yml` configuration

**Label Categories:**
- documentation, dependencies, ci, tests
- frontend, backend, database, security, configuration

## Branch Strategy

### Main Branches

- **`main`**: Production-ready code
  - Protected branch
  - Requires PR reviews
  - Runs full CI suite
  - Auto-deploys to staging

- **`develop`**: Integration branch
  - Latest development changes
  - Feature branches merge here first
  - Runs full CI suite

### Feature Branches

Format: `<type>/<description>`

**Types:**
- `feature/`: New features
- `bugfix/`: Bug fixes
- `hotfix/`: Urgent production fixes
- `docs/`: Documentation updates
- `refactor/`: Code refactoring
- `test/`: Test additions/improvements
- `chore/`: Maintenance tasks

**Examples:**
- `feature/add-board-filtering`
- `bugfix/fix-login-error`
- `docs/update-api-guide`

## Security

### Automated Security Measures

1. **CodeQL Analysis**
   - Runs on every push and PR
   - Scans for security vulnerabilities
   - Creates security alerts automatically

2. **Dependency Scanning**
   - Dependabot checks for vulnerable dependencies
   - Creates automated PRs for updates
   - Weekly schedule for updates

3. **Dependency Review**
   - Reviews new dependencies in PRs
   - Blocks PRs with moderate+ vulnerabilities
   - Comments with detailed findings

### Secret Management

**Never commit secrets!** Use GitHub Secrets for:
- API keys
- Database credentials
- Service tokens
- Deployment credentials

**Access Secrets in Workflows:**
```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
```

### Security Best Practices

1. Use environment-specific secrets
2. Rotate secrets regularly
3. Limit secret access to necessary workflows
4. Review security alerts promptly
5. Keep dependencies updated

## Deployment

### Staging Deployment

**When**: Automatic on push to `main`
**Environment**: staging
**Process**:
1. Checkout code
2. Install dependencies
3. Build application
4. Run tests
5. Deploy to staging environment

**Configuration Needed:**
- Add deployment commands in workflow
- Configure staging environment in GitHub
- Set up staging server/platform

### Production Deployment

**When**: On version tags (e.g., `v1.0.0`)
**Environment**: production
**Process**:
1. Checkout code
2. Install dependencies
3. Build application
4. Run tests
5. Deploy to production
6. Create GitHub release

**To Deploy:**
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Environment Configuration

Set up environments in GitHub:
1. Go to Settings → Environments
2. Create `staging` and `production` environments
3. Add environment-specific secrets
4. Configure protection rules for production

**Recommended Production Protection Rules:**
- Required reviewers
- Wait timer (optional)
- Deployment branches: tags only

## Maintenance

### Dependabot

**Configuration**: `.github/dependabot.yml`

**Update Schedule**:
- npm dependencies: Weekly (Mondays)
- GitHub Actions: Weekly (Mondays)

**Auto-merge Strategy**:
- Patch updates: Can be auto-merged
- Minor updates: Review recommended
- Major updates: Always review

### Stale Issues/PRs

- Automated cleanup of inactive issues/PRs
- Can be disabled by adding exempt labels
- Notifications before closing

### Monitoring

**Monitor:**
- Workflow run status
- Test coverage trends
- Build times
- Deployment success rate
- Security alerts

**Dashboards:**
- GitHub Actions tab
- Security tab → Code scanning alerts
- Insights → Dependency graph

## Troubleshooting

### Common Issues

#### 1. Workflow Fails with "npm ci" Error

**Cause**: Missing or invalid `package.json` or `package-lock.json`

**Solution:**
- Ensure `package.json` exists
- Run `npm install` to generate `package-lock.json`
- Commit both files

#### 2. Tests Fail Only in CI

**Cause**: Environment differences

**Solution:**
- Check environment variables
- Verify Node.js version matches
- Review test isolation

#### 3. Build Artifacts Not Available

**Cause**: Build directory doesn't exist

**Solution:**
- Ensure build script creates `dist/` or `build/`
- Check build script in `package.json`
- Verify artifact upload paths

#### 4. CodeQL Fails

**Cause**: Code doesn't compile or has syntax errors

**Solution:**
- Fix compilation errors locally first
- Ensure all dependencies are installed
- Check CodeQL logs for specific errors

#### 5. Deployment Fails

**Cause**: Missing secrets or configuration

**Solution:**
- Verify all required secrets are set
- Check environment configuration
- Review deployment logs
- Ensure deployment scripts are executable

### Getting Help

- **Check workflow logs**: GitHub Actions tab → Failed workflow → View logs
- **Review documentation**: This guide and GitHub Actions docs
- **Open an issue**: Create a bug report with workflow details
- **Ask in discussions**: GitHub Discussions for questions

## Future Enhancements

Potential improvements for the CI/CD pipeline:

1. **Performance**
   - Add Lighthouse CI for performance monitoring
   - Bundle size tracking
   - Performance regression detection

2. **Testing**
   - E2E testing with Playwright/Cypress
   - Visual regression testing
   - Load testing

3. **Deployment**
   - Canary deployments
   - Blue-green deployments
   - Automatic rollback on failure

4. **Monitoring**
   - Integration with monitoring services (Datadog, New Relic)
   - Slack/Discord notifications
   - Custom dashboards

5. **Quality**
   - SonarQube integration
   - Complexity analysis
   - Duplicate code detection

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Last Updated**: November 2025
**Maintained By**: Epitrello Team
