# Epitrello

[![CI](https://github.com/mpJunot/Epitrello/actions/workflows/ci.yml/badge.svg)](https://github.com/mpJunot/Epitrello/actions/workflows/ci.yml)
[![CodeQL](https://github.com/mpJunot/Epitrello/actions/workflows/codeql.yml/badge.svg)](https://github.com/mpJunot/Epitrello/actions/workflows/codeql.yml)
[![CD](https://github.com/mpJunot/Epitrello/actions/workflows/cd.yml/badge.svg)](https://github.com/mpJunot/Epitrello/actions/workflows/cd.yml)

EpiTrello is an online project management tool, inspired by Toyota's Kanban method.

It is based on the organization of projects into boards listing cards, each representing tasks.
Cards are assignable to users and are movable from one board to another, reflecting their progress.

## Development

### Prerequisites

- Node.js 18+ (recommended: Node.js 20)
- npm or yarn

### Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **CI Pipeline**: Runs on every push and pull request to `main` and `develop` branches
  - Linting with ESLint
  - Building the application
  - Running tests on multiple Node.js versions (18, 20, 22)
  - Code quality checks
  
- **Security Scanning**: 
  - CodeQL analysis for security vulnerabilities
  - Dependency review on pull requests
  
- **CD Pipeline**: Automated deployments
  - Staging: Deploys on push to `main`
  - Production: Deploys on version tags (`v*.*.*`)
  - Docker image builds and pushes

- **Automated Workflows**:
  - PR validation and size labeling
  - Stale issue and PR management
  - Automated releases with changelog generation

### Branch Naming Convention

When creating branches, please follow this convention:
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Urgent fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test additions/updates
- `build:` - Build system changes
- `ci:` - CI/CD changes
- `chore:` - Other changes

## Contributing

1. Fork the repository
2. Create a feature branch following the naming convention
3. Make your changes with proper commit messages
4. Ensure all tests pass and code is linted
5. Submit a pull request

## License

This project is part of the Epitech Professional Work program.