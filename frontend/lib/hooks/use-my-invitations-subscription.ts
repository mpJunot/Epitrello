'use client';

import { useEffect } from 'react';
import { createClient, type SubscribePayload } from 'graphql-ws';
import { getAuthToken } from '../graphql-client';
import type { QueryClient } from '@tanstack/react-query';
import { myInvitationsQueryKey } from '@/lib/queries/workspaces';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

function getWsUrl(): string {
  if (typeof window === 'undefined') return '';
  return API_URL.replace(/^http:\/\//, 'ws://').replace(
    /^https:\/\//,
    'wss://',
  );
}

/**
 * Subscribe to "my invitations" changes (new invite, accept, reject, cancel).
 * Invalidates the myInvitations query so the list and badge update in real time when you are invited.
 */
export function useMyInvitationsSubscription(
  queryClient: QueryClient,
  userId: string | null,
  enabled = true,
): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !userId || !enabled) return;

    const token = getAuthToken();
    if (!token) return;

    const wsUrl = getWsUrl();
    if (!wsUrl) return;

    const client = createClient({
      url: wsUrl,
      connectionParams: {
        Authorization: `Bearer ${token}`,
        authToken: token,
      },
      retryAttempts: 5,
      shouldRetry: () => true,
    });

    const unsub = client.subscribe(
      {
        query: `subscription MyInvitationsUpdated($userId: ID!) {
          myInvitationsUpdated(userId: $userId)
        }`,
        variables: { userId },
      } as SubscribePayload,
      {
        next: () => {
          queryClient.invalidateQueries({ queryKey: myInvitationsQueryKey });
        },
        error: (err: unknown) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              '[MyInvitations] subscription error',
              err instanceof Error ? err.message : String(err),
            );
          }
        },
        complete: () => {},
      },
    );

    return () => {
      if (typeof unsub === 'function') {
        unsub();
      } else if (unsub && typeof (unsub as { unsubscribe?: () => void }).unsubscribe === 'function') {
        (unsub as { unsubscribe: () => void }).unsubscribe();
      }
    };
  }, [queryClient, userId, enabled]);
}
