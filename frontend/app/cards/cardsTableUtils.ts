import type { CardRow, DueDateFilter } from './types';

export function formatDueDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function isOverdue(dueDate: string | null | undefined, completed?: boolean): boolean {
  if (completed || !dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function cardMatchesDueDateFilter(
  card: CardRow,
  filter: DueDateFilter,
): boolean {
  if (filter === 'all') return true;
  const now = new Date();
  const due = card.dueDate ? new Date(card.dueDate) : null;
  if (filter === 'noDate') return !due;
  if (filter === 'overdue') return !!due && !card.completed && due < now;
  if (filter === 'dueThisWeek') {
    if (!due || card.completed) return false;
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    return due >= now && due <= endOfWeek;
  }
  if (filter === 'dueThisMonth') {
    if (!due || card.completed) return false;
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return due >= now && due <= endOfMonth;
  }
  return true;
}
