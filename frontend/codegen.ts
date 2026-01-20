import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../backend/src/graphql/schema.gql',
  documents: ['**/*.{ts,tsx}', '!**/*.d.ts', '!**/node_modules/**', '!**/lib/graphql-types.ts'],
  generates: {
    './lib/graphql-types.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
      ],
      config: {
        skipTypename: false,
        enumsAsTypes: true,
        scalars: {
          DateTime: 'string',
          ID: 'string',
        },
        maybeValue: 'T | null',
        avoidOptionals: false,
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
