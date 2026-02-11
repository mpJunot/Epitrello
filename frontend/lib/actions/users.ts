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

function getUploadBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/graphql';
  const base = (apiUrl || '').trim().replace(/\/graphql\/?$/i, '');
  return base || 'http://localhost:4000';
}

async function uploadFile(
  endpoint: 'avatar' | 'background',
  field: 'avatar' | 'background',
  file: File,
): Promise<{ url: string }> {
  const baseUrl = getUploadBaseUrl();
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (!token?.trim()) {
    throw new Error('Vous devez être connecté pour envoyer une image.');
  }
  const formData = new FormData();
  formData.append(field, file);
  const uploadUrl = `${baseUrl.replace(/\/$/, '')}/api/upload/${endpoint}`;
  let res: Response;
  try {
    res = await fetch(uploadUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      credentials: 'include',
    });
  } catch (networkError) {
    const msg = networkError instanceof Error ? networkError.message : 'Erreur réseau';
    throw new Error(`Impossible de contacter le serveur (${uploadUrl}): ${msg}`);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const msg = err?.message;
    let text = Array.isArray(msg) ? msg.join(', ') : typeof msg === 'string' ? msg : res.statusText;
    if (res.status === 401) {
      text = 'Session expirée ou non autorisée. Reconnectez-vous puis réessayez.';
    } else if (res.status === 404) {
      text = "Point d’upload introuvable. Vérifiez que NEXT_PUBLIC_API_URL pointe vers le backend.";
    } else if (res.status === 413) {
      text = 'Fichier trop volumineux.';
    }
    throw new Error(text || 'Échec de l’upload.');
  }
  const data = await res.json().catch(() => null);
  if (data && typeof data.url === 'string') return { url: data.url };
  throw new Error('Réponse du serveur invalide (URL manquante).');
}

/**
 * Upload avatar image. Backend saves the file and returns the new avatar URL.
 */
export async function uploadAvatar(file: File): Promise<{ url: string }> {
  return uploadFile('avatar', 'avatar', file);
}

/**
 * Upload background image (board or card). Backend saves to GCS or disk and returns the public URL.
 */
export async function uploadBackground(file: File): Promise<{ url: string }> {
  return uploadFile('background', 'background', file);
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
