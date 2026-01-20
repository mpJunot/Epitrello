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

    // 🔍 DEBUG: Log de la requête GraphQL
    console.log('🚀 GraphQL Request:', {
        url: API_URL,
        hasToken: !!token,
        query: query.trim().split('\n')[0] + '...', // Première ligne de la query
        variables: JSON.stringify(variables, null, 2),
        variablesType: typeof variables,
        variablesKeys: variables ? Object.keys(variables) : [],
    });

    try {
        const requestBody = {
            query,
            variables,
        };
        
        console.log('📦 Body stringifié:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('❌ GraphQL HTTP Error:', { status: response.status, statusText: response.statusText, body: text });
            throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
        }

        const result: GraphQLResponse<T> = await response.json();
        
        console.log('✅ GraphQL Response:', {
            hasData: !!result.data,
            hasErrors: !!result.errors,
            data: result.data,
        });

        if (result.errors) {
            console.error('❌ GraphQL Errors détaillées:', JSON.stringify(result.errors, null, 2));
            console.error('❌ Extensions complètes:', result.errors.map(e => e.extensions));
            const errorMsg = result.errors.map(e => e.message).join(', ');
            throw new Error(errorMsg || 'GraphQL request failed');
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
