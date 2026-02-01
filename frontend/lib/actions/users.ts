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
 * Get a user by ID (for viewing another user's profile). Returns null if not found.
 */
export async function getUser(id: string): Promise<User | null> {
  const query = `
    query User($id: ID!) {
      user(id: $id) {
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
    const result = await graphqlRequest<{ user: User | null }>(query, { id });
    return result.user ?? null;
  } catch {
    return null;
  }
}

/**
 * Get a user by email (for board invite flow). Returns null if not found.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const query = `
    query UserByEmail($email: String!) {
      userByEmail(email: $email) {
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
    const result = await graphqlRequest<{ userByEmail: User | null }>(query, { email: email.trim() });
    return result.userByEmail ?? null;
  } catch {
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
