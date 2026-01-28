import { getAvatarColor } from '@/lib/utils/avatar-colors';

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatLastActive(date: string | null | undefined): string {
  if (!date) return 'No recent activity';
  const d = new Date(date);
  const now = new Date();
  const diffMonths =
    (now.getFullYear() - d.getFullYear()) * 12 +
    (now.getMonth() - d.getMonth());

  if (diffMonths === 0) return 'Last active this month';
  if (diffMonths === 1) return 'Last active last month';
  if (diffMonths < 12) return `Last active ${diffMonths} months ago`;

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `Last active ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

export { getAvatarColor };
