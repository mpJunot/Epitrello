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

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('[GraphQL Client] Request', {
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

    console.log('[GraphQL Client] Sending request', {
      url: API_URL,
      method: 'POST',
      hasToken: !!token,
      queryLength: query.length,
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log('[GraphQL Client] Response received', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[GraphQL Client] HTTP Error', {
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
        // not JSON, keep default
      }
      throw new Error(message);
    }

    const result: GraphQLResponse<T> = await response.json();

    console.log('[GraphQL Client] Response data', {
      hasData: !!result.data,
      hasErrors: !!result.errors,
      errors: result.errors,
    });

    if (result.errors) {
      console.error('[GraphQL Client] GraphQL Errors', {
        errors: result.errors.map(e => ({
          message: e.message,
          extensions: e.extensions,
        })),
      });
      const errorMsg = result.errors.map(e => e.message).join(', ');
      throw new Error(errorMsg || 'GraphQL request failed');
    }

    if (!result.data) {
      console.error('[GraphQL Client] No data in response', { result });
      throw new Error('No data returned from GraphQL request');
    }

    console.log('[GraphQL Client] Request successful');
    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.warn('[GraphQL Client] Authentication error, clearing token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Session expired. Please log in again.');
      }
      console.error('[GraphQL Client] Error occurred', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
    console.error('[GraphQL Client] Unknown error occurred', { error });
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
  }
}
