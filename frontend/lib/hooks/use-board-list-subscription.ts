'use client';

import { useEffect } from 'react';
import { createClient, type SubscribePayload } from 'graphql-ws';
import { getAuthToken } from '../graphql-client';
import type { QueryClient } from '@tanstack/react-query';
import { boardQueryKey } from '@/app/boards/[id]/queries';
import type { Board, List } from '@/app/boards/[id]/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

function getWsUrl(): string {
  if (typeof window === 'undefined') return '';
  const url = API_URL.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
  return url;
}

interface SubscriptionList {
  id: string;
  title: string;
  position: number;
  isArchived: boolean;
  boardId: string;
}

function upsertList(lists: List[] | undefined, incoming: SubscriptionList): List[] {
  const base: List[] = lists ?? [];
  const idx = base.findIndex((l) => l.id === incoming.id);
  const nextList: List = {
    id: incoming.id,
    title: incoming.title,
    position: incoming.position,
    isArchived: incoming.isArchived,
    cards: base[idx]?.cards ?? [],
  };

  if (idx === -1) {
    return [...base, nextList].sort((a, b) => a.position - b.position);
  }

  const next = [...base];
  next[idx] = nextList;
  return next.sort((a, b) => a.position - b.position);
}

/**
 * Subscribe to real-time list updates for a board (create/update/reorder/archive/unarchive).
 * This keeps the board.lists cache in sync across clients without manual refetch.
 */
export function useBoardListSubscription(
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

    const unsubUpdated = client.subscribe(
      {
        query: `subscription ListUpdated($boardId: ID!) {
          listUpdated(boardId: $boardId) {
            id
            title
            position
            isArchived
            boardId
          }
        }`,
        variables: { boardId },
      } as SubscribePayload,
      {
        next: (data) => {
          const list = (data.data as { listUpdated?: SubscriptionList })?.listUpdated;
          if (!list) return;
          queryClient.setQueryData<Board>(boardQueryKey(boardId), (old) => {
            if (!old) return old;
            return {
              ...old,
              lists: upsertList(old.lists, list),
            };
          });
        },
        error: (err) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[useBoardListSubscription]', err);
          }
        },
        complete: () => {},
      },
    );

    const unsubDeleted = client.subscribe(
      {
        query: `subscription ListDeleted($boardId: ID!) {
          listDeleted(boardId: $boardId)
        }`,
        variables: { boardId },
      } as SubscribePayload,
      {
        next: (data) => {
          const deletedId = (data.data as { listDeleted?: string })?.listDeleted;
          if (!deletedId) return;
          queryClient.setQueryData<Board>(boardQueryKey(boardId), (old) => {
            if (!old?.lists) return old;
            return {
              ...old,
              lists: (old.lists ?? []).filter((l) => l.id !== deletedId),
            };
          });
        },
        error: (err) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[useBoardListSubscription:deleted]', err);
          }
        },
        complete: () => {},
      },
    );

    return () => {
      unsubUpdated();
      unsubDeleted();
      client.dispose();
    };
  }, [boardId, queryClient, enabled]);
}

