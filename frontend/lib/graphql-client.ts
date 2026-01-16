/**
 * GraphQL Client for Epitrello API
 * Handles all communication with the backend GraphQL endpoint
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

export interface GraphQLResponse<T> {
    data?: T;
    errors?: Array<{ message: string }>;
}

export async function graphqlRequest<T>(
    query: string,
    variables?: Record<string, any>
): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
        }

        const result: GraphQLResponse<T> = await response.json();

        if (result.errors) {
            throw new Error(result.errors[0].message || 'GraphQL request failed');
        }

        if (!result.data) {
            throw new Error('No data returned from GraphQL request');
        }

        return result.data;
    } catch (error) {
        if (error instanceof Error) {
            // Check if it's an authentication error
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth_token');
                }
                throw new Error('Session expired. Please log in again.');
            }
            throw error;
        }
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
