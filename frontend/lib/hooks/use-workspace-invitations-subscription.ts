'use client';

import { useEffect } from 'react';
import { createClient, type SubscribePayload } from 'graphql-ws';
import { getAuthToken } from '../graphql-client';
import type { QueryClient } from '@tanstack/react-query';
import { workspaceInvitationsQueryKey } from '@/lib/queries/workspaces';

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
 * Subscribe to workspace invitations (join requests) changes.
 * Invalidates the workspace invitations query so the Join requests tab updates in real time.
 */
export function useWorkspaceInvitationsSubscription(
  workspaceId: string | null,
  queryClient: QueryClient,
  enabled = true,
): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !workspaceId || !enabled) return;

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
        query: `subscription WorkspaceInvitationsUpdated($workspaceId: ID!) {
          workspaceInvitationsUpdated(workspaceId: $workspaceId)
        }`,
        variables: { workspaceId },
      } as SubscribePayload,
      {
        next: () => {
          queryClient.invalidateQueries({
            queryKey: workspaceInvitationsQueryKey(workspaceId),
          });
        },
        error: (err: unknown) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              '[WorkspaceInvitations] subscription error',
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
  }, [workspaceId, queryClient, enabled]);
}
