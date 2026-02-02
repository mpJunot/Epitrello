'use client';

import { useEffect, useRef } from 'react';
import { createClient, type SubscribePayload } from 'graphql-ws';
import { getAuthToken } from '../graphql-client';
import type { Notification } from '../actions/notifications';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

function getWsUrl(): string {
  if (typeof window === 'undefined') return '';
  return API_URL.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
}

export interface UseNotificationSubscriptionCallbacks {
  onNotification?: (notification: Notification) => void;
  onError?: (error: unknown) => void;
}

/**
 * Subscribe to real-time notifications for the current user (WebSocket).
 * Only runs in the browser when the user is authenticated.
 */
export function useNotificationSubscription(
  callbacks: UseNotificationSubscriptionCallbacks,
  enabled = true
): void {
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const token = typeof window !== 'undefined' ? getAuthToken() : null;
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;

    const authToken = getAuthToken();
    if (!authToken) return;

    const wsUrl = getWsUrl();
    if (!wsUrl) return;

    if (process.env.NODE_ENV === 'development') {
      console.debug('[Notifications] WebSocket subscription connecting to', wsUrl);
    }

    const client = createClient({
      url: wsUrl,
      connectionParams: {
        Authorization: `Bearer ${authToken}`,
        authToken: authToken,
      },
      retryAttempts: 5,
      shouldRetry: () => true,
    });

    const unsub = client.subscribe(
      {
        query: `subscription NotificationReceived {
          notificationReceived {
            id
            userId
            type
            payload
            read
            createdAt
          }
        }`,
      } as SubscribePayload,
      {
        next: (data) => {
          const notification = (data.data as { notificationReceived?: Notification })
            ?.notificationReceived;
          if (notification) {
            if (process.env.NODE_ENV === 'development') {
              console.debug('[Notifications] Real-time notification received', notification.id, notification.type);
            }
            callbacksRef.current.onNotification?.(notification);
          }
        },
        error: (err) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Notifications] WebSocket subscription error:', err);
          }
          callbacksRef.current.onError?.(err);
        },
        complete: () => {},
      }
    );

    return () => {
      unsub();
      client.dispose();
    };
  }, [enabled, token]);
}
