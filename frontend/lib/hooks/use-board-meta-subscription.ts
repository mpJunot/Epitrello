'use client';

import { useEffect } from 'react';
import { createClient, type SubscribePayload } from 'graphql-ws';
import { getAuthToken } from '../graphql-client';
import type { QueryClient } from '@tanstack/react-query';
import { boardQueryKey } from '@/app/boards/[id]/queries';
import type { Board } from '@/app/boards/[id]/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

function getWsUrl(): string {
  if (typeof window === 'undefined') return '';
  const url = API_URL.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
  return url;
}

interface SubscriptionBoard {
  id: string;
  title: string;
  description?: string | null;
  visibility: string;
  background?: string | null;
  isArchived: boolean;
}

/**
 * Subscribe to board metadata changes (title, description, visibility, background, archive).
 * Updates the cached board header information without refetch.
 */
export function useBoardMetaSubscription(
  boardId: string | null,
  queryClient: QueryClient,
  enabled = true,
): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !boardId || !enabled) return;

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
        query: `subscription BoardUpdated($boardId: ID!) {
          boardUpdated(boardId: $boardId) {
            id
            title
            description
            visibility
            background
            isArchived
          }
        }`,
        variables: { boardId },
      } as SubscribePayload,
      {
        next: (data) => {
          const board = (data.data as { boardUpdated?: SubscriptionBoard })?.boardUpdated;
          if (!board) return;
          queryClient.setQueryData<Board>(boardQueryKey(boardId), (old) => {
            if (!old) return old;
            return {
              ...old,
              title: board.title,
              description: board.description ?? undefined,
              visibility: board.visibility as Board['visibility'],
              background: board.background ?? undefined,
              isArchived: board.isArchived,
            };
          });
        },
        error: (err) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[useBoardMetaSubscription]', err);
          }
        },
        complete: () => {},
      },
    );

    return () => {
      unsub();
      client.dispose();
    };
  }, [boardId, queryClient, enabled]);
}

