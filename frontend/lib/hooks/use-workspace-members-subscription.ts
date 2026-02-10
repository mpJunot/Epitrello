'use client';

import { useEffect } from 'react';
import { createClient, type SubscribePayload } from 'graphql-ws';
import { getAuthToken } from '../graphql-client';
import type { QueryClient } from '@tanstack/react-query';
import { workspaceMembersQueryKey } from '@/lib/queries/workspaces';

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
 * Subscribe to workspace members changes (add, remove, role update).
 * Invalidates the workspace members query so the list refetches in real time.
 */
export function useWorkspaceMembersSubscription(
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
        query: `subscription WorkspaceMembersUpdated($workspaceId: ID!) {
          workspaceMembersUpdated(workspaceId: $workspaceId)
        }`,
        variables: { workspaceId },
      } as SubscribePayload,
      {
        next: () => {
          queryClient.invalidateQueries({
            queryKey: workspaceMembersQueryKey(workspaceId),
          });
        },
        error: (err: unknown) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              '[WorkspaceMembers] subscription error',
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
