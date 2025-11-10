# Backend Structure - Node.js + TypeScript + GraphQL

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB configuration
│   │   └── environment.ts       # Environment variables
│   ├── models/
│   │   ├── User.ts             # User model
│   │   ├── Board.ts            # Board model
│   │   ├── List.ts             # List/column model
│   │   ├── Card.ts             # Card model
│   │   └── index.ts            # Models export
│   ├── graphql/
│   │   ├── typeDefs.ts         # All GraphQL type definitions
│   │   ├── resolvers.ts        # All GraphQL resolvers
│   │   └── scalars/
│   │       └── date.ts         # Custom Date scalar
│   # (Note: Modular structure with separate typeDefs/ and resolvers/ directories is planned for future refactoring.)
│   ├── middleware/
│   │   # (Planned) auth.ts             # Authentication middleware
│   │   # (Planned) validation.ts       # Data validation
│   │   # (Planned) errorHandler.ts     # Error handling
│   ├── utils/
│   │   ├── jwt.ts              # JWT utilities
│   │   ├── context.ts          # GraphQL context
│   │   ├── permissions.ts      # Permissions management
│   │   └── validators.ts       # Validation functions
│   ├── services/
│   │   ├── authService.ts      # Authentication service
│   │   ├── boardService.ts     # Board service
│   │   ├── listService.ts      # List service
│   │   └── cardService.ts      # Card service
│   ├── types/
│   # Note: The files listed under `src/utils/` and `src/services/` (jwt.ts, context.ts, permissions.ts, validators.ts, authService.ts, boardService.ts, listService.ts, cardService.ts) are planned for future implementation and do not currently exist in this codebase.
│   │   ├── context.ts          # TypeScript types for context
│   │   └── auth.ts             # Authentication types
│   └── index.ts                # Main entry point
├── tests/
│   ├── __mocks__/              # Test mocks
│   ├── integration/            # Integration tests
│   ├── unit/                   # Unit tests
│   └── setup.ts                # Test configuration
├── dist/                       # Compiled files (generated)
├── node_modules/               # Dependencies (generated)
├── .env                        # Environment variables (git ignored)
├── .env.example                # Environment variables example
├── .gitignore                  # Files to ignore
├── .npmrc                      # pnpm configuration
├── eslint.config.js            # ESLint configuration
├── jest.config.js              # Jest configuration
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml              # pnpm lock file (generated)
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Documentation
```

## Folder Descriptions

### `/src/config/`
Application configuration (database, environment variables)

### `/src/models/`
Mongoose models for MongoDB with TypeScript interfaces

### `/src/graphql/`
- `typeDefs/` : GraphQL schema definitions
- `resolvers/` : GraphQL resolution functions
- `scalars/` : Custom scalar types

### `/src/middleware/`
Express middleware and utility functions

### `/src/utils/`
Reusable utility functions

### `/src/services/`
Business logic separated from resolvers

### `/src/types/`
TypeScript type definitions

### `/tests/`
Unit and integration tests

## Configuration Files

- `package.json` : npm/pnpm dependencies and scripts
- `tsconfig.json` : TypeScript configuration
- `.npmrc` : pnpm specific configuration
- `eslint.config.js` : Linting rules
- `jest.config.js` : Test configuration

## Getting Started

Environment variables needed (create a .env file based on .env.example):

```bash
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/epitrello
JWT_SECRET=your_jwt_secret
```

### Installation & Setup

1. Install dependencies: `pnpm install`
2. Configure your environment variables in `.env`
3. Start development server: `pnpm dev`

The server will be available at http://localhost:4000

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Check TypeScript types
