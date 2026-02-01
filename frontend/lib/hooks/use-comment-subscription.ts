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

/** Comment shape from subscription (matches backend Comment type). */
export interface SubscriptionComment {
  id: string;
  cardId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name: string | null; email: string; avatar: string | null } | null;
}

export interface CommentDeletedEvent {
  commentId: string;
  cardId: string;
}

export interface UseCommentSubscriptionCallbacks {
  onCommentAdded?: (comment: SubscriptionComment) => void;
  onCommentUpdated?: (comment: SubscriptionComment) => void;
  onCommentDeleted?: (event: CommentDeletedEvent) => void;
}

/**
 * Subscribe to real-time comment events for a card (add / update / delete).
 * Only runs in the browser; requires a valid auth token.
 */
export function useCommentSubscription(
  cardId: string | null,
  callbacks: UseCommentSubscriptionCallbacks,
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
    });

    const unsubAdded = client.subscribe(
      {
        query: `subscription CommentAdded($cardId: ID!) {
          commentAdded(cardId: $cardId) {
            id
            cardId
            authorId
            content
            createdAt
            updatedAt
            author { id name email avatar }
          }
        }`,
        variables: { cardId },
      } as SubscribePayload,
      {
        next: (data) => {
          const comment = (data.data as { commentAdded?: SubscriptionComment })?.commentAdded;
          if (comment) callbacksRef.current.onCommentAdded?.(comment);
        },
        error: () => {},
        complete: () => {},
      },
    );

    const unsubUpdated = client.subscribe(
      {
        query: `subscription CommentUpdated($cardId: ID!) {
          commentUpdated(cardId: $cardId) {
            id
            cardId
            authorId
            content
            createdAt
            updatedAt
            author { id name email avatar }
          }
        }`,
        variables: { cardId },
      } as SubscribePayload,
      {
        next: (data) => {
          const comment = (data.data as { commentUpdated?: SubscriptionComment })?.commentUpdated;
          if (comment) callbacksRef.current.onCommentUpdated?.(comment);
        },
        error: () => {},
        complete: () => {},
      },
    );

    const unsubDeleted = client.subscribe(
      {
        query: `subscription CommentDeleted($cardId: ID!) {
          commentDeleted(cardId: $cardId) {
            commentId
            cardId
          }
        }`,
        variables: { cardId },
      } as SubscribePayload,
      {
        next: (data) => {
          const event = (data.data as { commentDeleted?: CommentDeletedEvent })?.commentDeleted;
          if (event) callbacksRef.current.onCommentDeleted?.(event);
        },
        error: () => {},
        complete: () => {},
      },
    );

    return () => {
      unsubAdded();
      unsubUpdated();
      unsubDeleted();
      client.dispose();
    };
  }, [cardId, enabled]);
}
