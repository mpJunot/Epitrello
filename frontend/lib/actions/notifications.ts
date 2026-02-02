import { graphqlRequest } from '../graphql-client';

export type NotificationType =
  | 'CARD_ASSIGNED'
  | 'CARD_DUE_SOON'
  | 'COMMENT_ADDED'
  | 'BOARD_INVITATION'
  | 'WORKSPACE_INVITATION';

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  payload?: string | null;
  read: boolean;
  createdAt: string;
};

export type MyNotificationsInput = {
  cursor?: string | null;
  limit?: number | null;
  unreadOnly?: boolean | null;
};

export type MyNotificationsResult = {
  notifications: Notification[];
  hasMore: boolean;
  nextCursor?: string | null;
};

const NOTIFICATION_FRAGMENT = `
  id
  userId
  type
  payload
  read
  createdAt
`;

/**
 * Get current user notifications with pagination.
 */
export async function getMyNotifications(
  input: MyNotificationsInput = {}
): Promise<MyNotificationsResult> {
  const query = `
    query MyNotifications($input: MyNotificationsInput) {
      myNotifications(input: $input) {
        notifications { ${NOTIFICATION_FRAGMENT} }
        hasMore
        nextCursor
      }
    }
  `;
  const result = await graphqlRequest<{ myNotifications: MyNotificationsResult }>(
    query,
    { input: { limit: input.limit ?? 20, cursor: input.cursor ?? null, unreadOnly: input.unreadOnly ?? null } }
  );
  return result.myNotifications;
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(id: string): Promise<Notification> {
  const mutation = `
    mutation MarkNotificationRead($id: ID!) {
      markNotificationRead(id: $id) { ${NOTIFICATION_FRAGMENT} }
    }
  `;
  const result = await graphqlRequest<{ markNotificationRead: Notification }>(
    mutation,
    { id }
  );
  return result.markNotificationRead;
}

/**
 * Mark all notifications as read. Returns count of updated.
 */
export async function markAllNotificationsRead(): Promise<number> {
  const mutation = `
    mutation MarkAllNotificationsRead {
      markAllNotificationsRead
    }
  `;
  const result = await graphqlRequest<{ markAllNotificationsRead: number }>(
    mutation
  );
  return result.markAllNotificationsRead;
}

export type NotificationEmailFrequency =
  | 'PERIODICALLY'
  | 'INSTANT'
  | 'DAILY'
  | 'NEVER';

export type NotificationPreferences = {
  emailFrequency: NotificationEmailFrequency;
  allowDesktopNotifications: boolean;
};

export type UpdateNotificationPreferencesInput = {
  emailFrequency?: NotificationEmailFrequency;
  allowDesktopNotifications?: boolean;
};

/**
 * Get current user notification preferences.
 */
export async function getMyNotificationPreferences(): Promise<NotificationPreferences> {
  const query = `
    query MyNotificationPreferences {
      myNotificationPreferences {
        emailFrequency
        allowDesktopNotifications
      }
    }
  `;
  const result = await graphqlRequest<{ myNotificationPreferences: NotificationPreferences }>(
    query
  );
  return result.myNotificationPreferences;
}

/**
 * Update current user notification preferences.
 */
export async function updateMyNotificationPreferences(
  input: UpdateNotificationPreferencesInput
): Promise<NotificationPreferences> {
  const mutation = `
    mutation UpdateMyNotificationPreferences($input: UpdateNotificationPreferencesInput!) {
      updateMyNotificationPreferences(input: $input) {
        emailFrequency
        allowDesktopNotifications
      }
    }
  `;
  const result = await graphqlRequest<{
    updateMyNotificationPreferences: NotificationPreferences;
  }>(mutation, { input });
  return result.updateMyNotificationPreferences;
}

/** Parsed payload (cardId, boardId, commentId, invitationId). */
export type NotificationPayload = {
  cardId?: string;
  boardId?: string;
  commentId?: string;
  invitationId?: string;
};

export function parseNotificationPayload(notification: Notification): NotificationPayload {
  try {
    return (notification.payload ? JSON.parse(notification.payload) : {}) as NotificationPayload;
  } catch {
    return {};
  }
}

/**
 * URL to navigate to when clicking a notification (board, invitations page).
 * For COMMENT_ADDED, links to the board with cardId so the user can open the card.
 */
export function notificationHref(notification: Notification): string | null {
  const payload = parseNotificationPayload(notification);
  switch (notification.type) {
    case 'CARD_ASSIGNED':
    case 'CARD_DUE_SOON':
      return payload.boardId ? `/boards/${payload.boardId}` : null;
    case 'COMMENT_ADDED':
      if (!payload.boardId) return null;
      return payload.cardId
        ? `/boards/${payload.boardId}?cardId=${payload.cardId}`
        : `/boards/${payload.boardId}`;
    case 'BOARD_INVITATION':
      return payload.boardId ? `/boards/${payload.boardId}` : null;
    case 'WORKSPACE_INVITATION':
      return '/invitations';
    default:
      return null;
  }
}

/**
 * Human-readable message for a notification (for toasts and list).
 */
export function notificationMessage(notification: Notification): string {
  try {
    switch (notification.type) {
      case 'CARD_ASSIGNED':
        return 'You were assigned to a card';
      case 'CARD_DUE_SOON':
        return 'A card is due soon';
      case 'COMMENT_ADDED':
        return 'New comment on a card you\'re assigned to';
      case 'BOARD_INVITATION':
        return 'You were added to a board';
      case 'WORKSPACE_INVITATION':
        return 'You were invited to a workspace';
      default:
        return 'New notification';
    }
  } catch {
    return 'New notification';
  }
}
