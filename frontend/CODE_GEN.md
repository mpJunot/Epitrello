# GraphQL Code Generation

This project uses GraphQL Code Generator to automatically generate TypeScript types from the GraphQL schema.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Make sure the backend has generated its GraphQL schema:
```bash
cd ../backend
pnpm build  # This generates src/graphql/schema.gql
```

3. Generate TypeScript types:
```bash
pnpm codegen
```

## Usage

After running `pnpm codegen`, types will be generated in `lib/graphql-types.ts`.

### Example Usage

```typescript
import { Board, User, Card } from '@/lib/graphql-types';

// Use the generated types
const board: Board = {
  id: '123',
  title: 'My Board',
  visibility: 'PUBLIC',
  // ... other fields
};
```

### Watch Mode

To automatically regenerate types when the schema changes:

```bash
pnpm codegen:watch
```

## Generated Types

The generator creates:
- TypeScript types for all GraphQL types (User, Board, Card, etc.)
- TypeScript types for all GraphQL inputs (CreateBoardInput, etc.)
- TypeScript types for all GraphQL enums (Visibility, Role, etc.)
- TypeScript types for all GraphQL operations (queries, mutations)

## Notes

- The schema file is located at `../backend/src/graphql/schema.gql`
- Types are generated from the GraphQL schema, not directly from Prisma
- Regenerate types after backend schema changes
