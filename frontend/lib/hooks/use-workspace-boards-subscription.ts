'use client';

import { useEffect } from 'react';
import { createClient, type SubscribePayload } from 'graphql-ws';
import { getAuthToken } from '../graphql-client';
import type { QueryClient } from '@tanstack/react-query';
import { workspaceBoardsQueryKey } from '@/lib/queries/workspaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

function getWsUrl(): string {
  if (typeof window === 'undefined') return '';
  const url = API_URL.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
  return url;
}

/**
 * Subscribe to workspace boards list changes (board created, deleted, copied, archived, unarchived).
 * Invalidates the workspace boards query so the list refreshes in real time.
 */
export function useWorkspaceBoardsSubscription(
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
        query: `subscription WorkspaceBoardsChanged($workspaceId: ID!) {
          workspaceBoardsChanged(workspaceId: $workspaceId)
        }`,
        variables: { workspaceId },
      } as SubscribePayload,
      {
        next: () => {
          queryClient.invalidateQueries({ queryKey: workspaceBoardsQueryKey(workspaceId) });
        },
        error: (err) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[useWorkspaceBoardsSubscription]', err);
          }
        },
        complete: () => {},
      },
    );

    return () => {
      unsub();
    };
  }, [workspaceId, queryClient, enabled]);
}
