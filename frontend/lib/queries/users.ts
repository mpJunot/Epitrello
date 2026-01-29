'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/actions/users';

export const currentUserQueryKey = ['user', 'current'] as const;

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: () => getCurrentUser(),
  });
}
