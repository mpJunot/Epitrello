import { graphqlRequest, type GraphQLRequestOptions } from '../graphql-client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  avatar?: string;
  description?: string;
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
        description
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
        description
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
        description
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
        description
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlRequest<{ updateUser: User }>(mutation, { id, input });
  return result.updateUser;
}

/**
 * Upload avatar image. Backend saves the file and updates the user's avatar. Returns the new avatar URL.
 */
export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/graphql';
  const baseUrl = apiUrl.replace(/\/graphql\/?$/, '') || 'http://localhost:4000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await fetch(`${baseUrl}/api/upload/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const msg = err?.message;
    const text = Array.isArray(msg) ? msg.join(', ') : typeof msg === 'string' ? msg : 'Upload failed';
    throw new Error(text);
  }
  return res.json();
}

/**
 * Delete the current user account. Caller should clear auth and redirect after.
 */
export async function deleteUser(id: string): Promise<boolean> {
  const mutation = `
    mutation DeleteUser($id: ID!) {
      deleteUser(id: $id)
    }
  `;
  const result = await graphqlRequest<{ deleteUser: boolean }>(mutation, { id });
  return result.deleteUser;
}
