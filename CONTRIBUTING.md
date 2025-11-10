# Contributing to Epitrello

Thank you for your interest in contributing to Epitrello! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Epitrello.git
   cd Epitrello
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/mpJunot/Epitrello.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Branch Naming Convention

Use the following prefixes for your branches:

- `feature/` - New features or enhancements
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or improvements
- `chore/` - Maintenance tasks

Example: `feature/add-board-filtering`

### Working on Your Changes

1. **Keep your branch up to date**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Make your changes** following the coding standards

3. **Test your changes**:
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit your changes** following the commit guidelines

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Changes to build system or dependencies
- `ci`: CI/CD configuration changes
- `chore`: Other changes that don't modify src or test files

### Examples

```bash
feat(board): add drag and drop for cards

Implement drag and drop functionality for moving cards between lists
using react-beautiful-dnd library.

Closes #123
```

```bash
fix(auth): resolve login token expiration issue

The authentication token was expiring too quickly, causing users
to be logged out unexpectedly.

Fixes #456
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**:
   ```bash
   npm test
   npm run lint
   npm run build
   ```
4. **Update the README.md** if you're changing functionality
5. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request** on GitHub
7. **Fill out the PR template** completely
8. **Wait for review** and address any feedback

### PR Requirements

- ✅ All tests pass
- ✅ Code is linted and follows style guidelines
- ✅ Documentation is updated
- ✅ Commit messages follow the convention
- ✅ PR title follows the convention
- ✅ Changes are focused and minimal
- ✅ No merge conflicts

### PR Title Format

Follow the same convention as commit messages:

```
feat(scope): add new feature
fix(scope): resolve bug
docs: update contributing guide
```

## Coding Standards

### JavaScript/TypeScript

- Use **ESLint** configuration provided in the project
- Follow **Airbnb Style Guide** for JavaScript
- Use **Prettier** for code formatting
- Write **clear, descriptive variable and function names**
- Add **JSDoc comments** for public APIs
- Keep functions **small and focused**
- Prefer **functional programming** patterns where appropriate

### File Structure

```
src/
├── components/      # React components
├── services/        # Business logic and API calls
├── utils/           # Utility functions
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── constants/       # Constants and configuration
└── tests/           # Test files
```

### Naming Conventions

- **Components**: PascalCase (e.g., `BoardCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `UserProfile`)

## Testing

### Writing Tests

- Write **unit tests** for all new functions
- Write **integration tests** for complex features
- Write **E2E tests** for critical user flows
- Aim for **80%+ code coverage**
- Use **descriptive test names**

### Test Structure

```javascript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = methodName(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.spec.js
```

## Code Review Process

1. At least **one maintainer** must approve the PR
2. All **CI checks** must pass
3. All **conversations** must be resolved
4. Code must meet **quality standards**
5. Changes must be **well-documented**

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/mpJunot/Epitrello/discussions)
- **Bug?** Open an [Issue](https://github.com/mpJunot/Epitrello/issues)
- **Feature idea?** Open a [Feature Request](https://github.com/mpJunot/Epitrello/issues/new?template=feature_request.yml)

## Recognition

Contributors will be recognized in:
- The project's README
- Release notes
- GitHub contributors page

Thank you for contributing to Epitrello! 🎉
