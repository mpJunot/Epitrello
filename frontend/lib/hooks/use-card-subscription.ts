'use client';

import { useEffect, useRef } from 'react';
import { createClient, type SubscribePayload } from 'graphql-ws';
import { getAuthToken } from '../graphql-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

function getWsUrl(): string {
  if (typeof window === 'undefined') return '';
  const url = API_URL.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
  return url;
}

/** Card shape from subscription (matches backend Card type). */
export interface SubscriptionCard {
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

export interface UseCardSubscriptionCallbacks {
  onCardUpdated?: (card: SubscriptionCard) => void;
}

/**
 * Subscribe to real-time card updates for a single card (e.g. card modal).
 * When another user updates the card (title, description, etc.), onCardUpdated is called.
 */
export function useCardSubscription(
  cardId: string | null,
  callbacks: UseCardSubscriptionCallbacks,
  enabled = true,
): void {
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (typeof window === 'undefined' || !cardId || !enabled) return;

    const token = getAuthToken();
    if (!token) return;

    const wsUrl = getWsUrl();
    if (!wsUrl) return;

    const client = createClient({
      url: wsUrl,
      connectionParams: {
        Authorization: `Bearer ${token}`,
      },
      retryAttempts: 5,
    });

    const unsub = client.subscribe(
      {
        query: `subscription CardUpdatedByCardId($cardId: ID!) {
          cardUpdatedByCardId(cardId: $cardId) {
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
        variables: { cardId },
      } as SubscribePayload,
      {
        next: (data) => {
          const card = (data.data as { cardUpdatedByCardId?: SubscriptionCard })?.cardUpdatedByCardId;
          if (card) callbacksRef.current.onCardUpdated?.(card);
        },
        error: (err) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[useCardSubscription]', err);
          }
        },
        complete: () => {},
      },
    );

    return () => {
      unsub();
      client.dispose();
    };
  }, [cardId, enabled]);
}
