'use client';

import { useEffect } from 'react';
import { createClient, type SubscribePayload } from 'graphql-ws';
import { getAuthToken } from '../graphql-client';
import type { QueryClient } from '@tanstack/react-query';
import { boardQueryKey } from '@/app/boards/[id]/queries';
import type { Board, Card } from '@/app/boards/[id]/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

function getWsUrl(): string {
  if (typeof window === 'undefined') return '';
  const url = API_URL.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
  return url;
}

/** Card shape from subscription (matches backend Card type). */
interface SubscriptionCard {
  id: string;
  listId: string;
  title: string;
  description?: string | null;
  background?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  position: number;
  completed: boolean;
  assignees?: Array<{ id: string; name: string | null; email: string; avatar: string | null }> | null;
  labels?: Array<{ id: string; name: string | null; color: string }> | null;
  checklists?: Array<{
    id: string;
    title: string;
    items?: Array<{ id: string; content: string; checked: boolean; position: number }> | null;
  }> | null;
}

function subscriptionCardToBoardCard(c: SubscriptionCard, boardId: string): Card {
  const dueDate = c.dueDate ?? undefined;
  const startDate = c.startDate ?? undefined;
  return {
    id: c.id,
    listId: c.listId,
    title: c.title,
    description: c.description ?? undefined,
    position: c.position,
    background: c.background ?? undefined,
    dueDate: typeof dueDate === 'string' ? dueDate : undefined,
    startDate: typeof startDate === 'string' ? startDate : undefined,
    completed: c.completed,
    createdAt: '',
    assignees: (c.assignees ?? []).map((a) => ({
      id: a.id,
      name: a.name ?? '',
      email: a.email,
      avatar: a.avatar ?? undefined,
    })),
    labels: (c.labels ?? []).map((l) => ({ ...l, boardId })),
    checklists: (c.checklists ?? []).map((cl) => ({
      id: cl.id,
      title: cl.title,
      items: (cl.items ?? []).map((item) => ({
        id: item.id,
        content: item.content,
        text: item.content,
        checked: item.checked,
        position: item.position,
        checklistId: cl.id,
      })),
    })),
  };
}

/**
 * Subscribe to real-time card updates for a board.
 * When any card on the board is updated (by anyone), the board cache is updated
 * so the list view reflects changes without refresh.
 */
export function useBoardCardSubscription(
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
        query: `subscription CardUpdated($boardId: ID!) {
          cardUpdated(boardId: $boardId) {
            id
            listId
            title
            description
            background
            startDate
            dueDate
            position
            completed
            assignees { id name email avatar }
            labels { id name color }
            checklists {
              id
              title
              items { id content checked position }
            }
          }
        }`,
        variables: { boardId },
      } as SubscribePayload,
      {
        next: (data) => {
          const card = (data.data as { cardUpdated?: SubscriptionCard })?.cardUpdated;
          if (!card) return;
          queryClient.setQueryData<Board>(boardQueryKey(boardId), (old) => {
            if (!old?.lists) return old;
            const updatedCard = subscriptionCardToBoardCard(card, boardId);
            return {
              ...old,
              lists: old.lists.map((list) => {
                const cards = list.cards ?? [];
                const hasCard = cards.some((c) => c.id === card.id);
                const isTargetList = list.id === card.listId;
                if (isTargetList) {
                  const idx = cards.findIndex((c) => c.id === card.id);
                  if (idx === -1) {
                    return { ...list, cards: [...cards, updatedCard] };
                  }
                  const next = [...cards];
                  next[idx] = updatedCard;
                  return { ...list, cards: next };
                }
                if (hasCard) {
                  return { ...list, cards: cards.filter((c) => c.id !== card.id) };
                }
                return list;
              }),
            };
          });
        },
        error: (err) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[useBoardCardSubscription]', err);
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
