import type { ActivityItem, ActivityType } from '@/lib/actions/activity';

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export function getActivityActionText(
  type: ActivityType,
  userName: string,
  payload: ActivityItem['payload']
): string {
  const name = userName || 'Someone';
  const card = payload?.cardTitle ? `"${payload.cardTitle}"` : 'a card';
  const list = payload?.listName ?? '';
  const targetList = payload?.targetListName ?? '';
  const board = payload?.boardTitle ?? 'a board';
  const member = payload?.memberName ?? '';
  const preview = payload?.commentPreview
    ? `: "${payload.commentPreview}"`
    : '';

  switch (type) {
    case 'CARD_CREATED':
      return `${name} created ${card} in ${list}`;
    case 'CARD_COMPLETED':
      return `${name} marked ${card} complete`;
    case 'CARD_UNCOMPLETED':
      return `${name} marked ${card} incomplete`;
    case 'CARD_MOVED':
      return targetList
        ? `${name} moved ${card} to ${targetList}`
        : `${name} moved ${card}`;
    case 'COMMENT_ADDED':
      return `${name} commented on ${card}${preview}`;
    case 'MEMBER_ADDED_TO_CARD':
      return member
        ? `${name} added ${member} to ${card}`
        : `${name} added a member to ${card}`;
    case 'MEMBER_ADDED_TO_BOARD':
      return member
        ? `${name} added ${member} to board ${board}`
        : `${name} added a member to ${board}`;
    case 'CARD_ARCHIVED':
      return `${name} archived ${card}`;
    case 'CARD_UNARCHIVED':
      return `${name} unarchived ${card}`;
    case 'LIST_ARCHIVED':
      return `${name} archived the list "${list || 'Untitled'}"`;
    case 'LIST_UNARCHIVED':
      return `${name} unarchived the list "${list || 'Untitled'}"`;
    case 'BOARD_ARCHIVED':
      return `${name} archived the board ${board}`;
    case 'BOARD_UNARCHIVED':
      return `${name} unarchived the board ${board}`;
    default:
      return `${name} performed an action`;
  }
}

/** Parts to render action text with user name and card name as separate linkable segments. */
export function getActivityActionParts(
  type: ActivityType,
  userName: string,
  payload: ActivityItem['payload']
): {
  userNameDisplay: string;
  afterName: string;
  cardDisplay: string;
  afterCard: string;
} | null {
  const name = userName || 'Someone';
  const cardDisplay = payload?.cardTitle ? `"${payload.cardTitle}"` : 'a card';
  const list = payload?.listName ?? '';
  const targetList = payload?.targetListName ?? '';
  const member = payload?.memberName ?? '';
  const preview = payload?.commentPreview
    ? `: "${payload.commentPreview}"`
    : '';

  switch (type) {
    case 'CARD_CREATED':
      return {
        userNameDisplay: name,
        afterName: ' created ',
        cardDisplay,
        afterCard: ` in ${list}`,
      };
    case 'CARD_COMPLETED':
      return {
        userNameDisplay: name,
        afterName: ' marked ',
        cardDisplay,
        afterCard: ' complete',
      };
    case 'CARD_UNCOMPLETED':
      return {
        userNameDisplay: name,
        afterName: ' marked ',
        cardDisplay,
        afterCard: ' incomplete',
      };
    case 'CARD_MOVED':
      return targetList
        ? {
            userNameDisplay: name,
            afterName: ' moved ',
            cardDisplay,
            afterCard: ` to ${targetList}`,
          }
        : {
            userNameDisplay: name,
            afterName: ' moved ',
            cardDisplay,
            afterCard: '',
          };
    case 'COMMENT_ADDED':
      return {
        userNameDisplay: name,
        afterName: ' commented on ',
        cardDisplay,
        afterCard: preview,
      };
    case 'MEMBER_ADDED_TO_CARD':
      return member
        ? {
            userNameDisplay: name,
            afterName: ` added ${member} to `,
            cardDisplay,
            afterCard: '',
          }
        : {
            userNameDisplay: name,
            afterName: ' added a member to ',
            cardDisplay,
            afterCard: '',
          };
    case 'CARD_ARCHIVED':
      return {
        userNameDisplay: name,
        afterName: ' archived ',
        cardDisplay,
        afterCard: '',
      };
    case 'CARD_UNARCHIVED':
      return {
        userNameDisplay: name,
        afterName: ' unarchived ',
        cardDisplay,
        afterCard: '',
      };
    default:
      return null;
  }
}
