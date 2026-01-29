/**
 * Generate a deterministic color for an avatar based on a name or email
 */
export function getAvatarColor(nameOrEmail?: string | null): string {
  if (!nameOrEmail) {
    return 'bg-gray-500';
  }

  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < nameOrEmail.length; i++) {
    hash = nameOrEmail.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Predefined color palette (similar to Trello)
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-teal-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-lime-500',
    'bg-emerald-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-violet-500',
  ];

  // Use absolute value of hash to get index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
