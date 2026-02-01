/**
 * GraphQL Client for Epitrello API
 * Handles all communication with the backend GraphQL endpoint
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

export interface GraphQLError {
  message: string;
  extensions?: unknown;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export interface GraphQLRequestOptions {
  /** When true, suppresses console logging for this request. */
  suppressLogs?: boolean;
  /** When true, suppresses auth-error logging and just clears token. */
  suppressAuthError?: boolean;
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: GraphQLRequestOptions
): Promise<T> {
  let token: string | null = null;

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token');
  } else {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      token = cookieStore.get('auth_token')?.value ?? cookieStore.get('token')?.value ?? null;
    } catch {
      token = null;
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const log = options?.suppressLogs ? () => undefined : console.log;
  const warn = options?.suppressLogs ? () => undefined : console.warn;
  const errorLog = options?.suppressLogs ? () => undefined : console.error;

  log('[GraphQL Client] Request', {
    url: API_URL,
    envVar: process.env.NEXT_PUBLIC_API_URL,
    hasToken: !!token,
    query: query.trim().split('\n')[0] + '...',
    variablesKeys: variables ? Object.keys(variables) : [],
  });

  try {
    const requestBody = {
      query,
      variables,
    };

    log('[GraphQL Client] Sending request', {
      url: API_URL,
      method: 'POST',
      hasToken: !!token,
      queryLength: query.length,
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      credentials: 'include',
    });

    log('[GraphQL Client] Response received', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const text = await response.text();
      errorLog('[GraphQL Client] HTTP Error', {
        status: response.status,
        statusText: response.statusText,
        body: text.substring(0, 500),
      });
      let message = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const body = JSON.parse(text) as { message?: string };
        if (body && typeof body.message === 'string') {
          message = body.message;
        }
      } catch {
        message = text;
      }
      throw new Error(message);
    }

    const result: GraphQLResponse<T> = await response.json();

    log('[GraphQL Client] Response data', {
      hasData: !!result.data,
      hasErrors: !!result.errors,
      errors: result.errors,
    });

    if (result.errors) {
      if (!options?.suppressAuthError || !result.errors.some(e => e.message?.toLowerCase().includes('unauthorized'))) {
        errorLog('[GraphQL Client] GraphQL Errors', {
          errors: result.errors.map(e => ({
            message: e.message,
            extensions: e.extensions,
          })),
        });
      }
      const errorMsg = result.errors.map(e => e.message).join(', ');
      throw new Error(errorMsg || 'GraphQL request failed');
    }

    if (!result.data) {
      console.error('[GraphQL Client] No data in response', { result });
      throw new Error('No data returned from GraphQL request');
    }

    log('[GraphQL Client] Request successful');
    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        if (!options?.suppressAuthError) {
          warn('[GraphQL Client] Authentication error, clearing token');
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        if (options?.suppressAuthError) {
          throw new Error('UNAUTHORIZED_QUIET');
        }
        throw new Error('Session expired. Please log in again.');
      }
      errorLog('[GraphQL Client] Error occurred', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
    errorLog('[GraphQL Client] Unknown error occurred', { error });
    throw new Error('An unknown error occurred');
  }
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

export function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  }
}

/**
 * Remove all Epitrello-related keys from localStorage (e.g. epitrello_workspaces,
 * epitrello_workspace_members_*, epitrello_notifications, etc.). Call on logout.
 */
export function clearEpitrelloLocalStorage() {
  if (typeof window === 'undefined') return;
  const keys = Object.keys(localStorage).filter((k) => k.startsWith('epitrello_'));
  keys.forEach((k) => localStorage.removeItem(k));
}

export function setAuthTokenCookie(token: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `auth_token=${token}; path=/; SameSite=Lax; max-age=2592000`;
  }
}
