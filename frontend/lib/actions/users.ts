import { graphqlRequest, type GraphQLRequestOptions } from '../graphql-client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  avatar?: string;
  password?: string;
}

/**
 * Get the currently authenticated user information
 */
export async function getCurrentUser(options?: GraphQLRequestOptions): Promise<User | null> {
  const query = `
    query Me {
      me {
        id
        email
        name
        avatar
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const result = await graphqlRequest<{ me: User | null }>(query, undefined, options);
    return result.me;
  } catch (error) {
    if (options?.suppressAuthError && error instanceof Error && error.message === 'UNAUTHORIZED_QUIET') {
      return null;
    }
    console.error('Failed to fetch current user', error);
    return null;
  }
}

/**
 * Update user information
 */
export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const mutation = `
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
      updateUser(id: $id, input: $input) {
        id
        email
        name
        avatar
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ updateUser: User }>(mutation, { id, input });
  return result.updateUser;
}
