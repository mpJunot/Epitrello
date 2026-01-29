import type { Checklist, DueDate } from './types';

export type BoardEventName =
  | 'epitrello:card-title-updated'
  | 'epitrello:card-description-updated'
  | 'epitrello:card-members-updated'
  | 'epitrello:card-labels-updated'
  | 'epitrello:card-checklists-updated'
  | 'epitrello:card-duedate-updated'
  | 'epitrello:card-startdate-updated'
  | 'epitrello:card-background-updated'
  | 'epitrello:card-background-updated'
  | 'epitrello:card-comments-updated'
  | 'epitrello:card-moved'
  | 'epitrello:card-move'
  | 'epitrello:card-copied'
  | 'epitrello:card-archived'
  | 'epitrello:card-deleted';

export function emitEvent(name: BoardEventName, detail: Record<string, unknown>) {
  try {
    console.log('📤 CardModal:', name, detail);
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch (err) {
    console.error('CardModal: failed to dispatch event', name, err);
  }
}

export function getChecklistProgress(checklist: Checklist): number {
  const items = checklist.items || [];
  if (items.length === 0) return 0;
  const checkedCount = items.filter((item) => item.checked).length;
  return Math.round((checkedCount / items.length) * 100);
}

export function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  };
  return date.toLocaleDateString('en-US', options);
}

export function formatCommentDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDueDateStatus(dueDate: DueDate): 'complete' | 'overdue' | 'soon' | 'upcoming' {
  if (dueDate.isComplete) return 'complete';

  const now = new Date();
  const due = new Date(dueDate.date);

  if (due < now) return 'overdue';

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (due < tomorrow) return 'soon';

  return 'upcoming';
}
