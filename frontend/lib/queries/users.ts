'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getUser } from '@/lib/actions/users';

export const currentUserQueryKey = ['user', 'current'] as const;

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: () => getCurrentUser(),
  });
}

export const userQueryKey = (id: string) => ['user', id] as const;

export function useUserQuery(userId: string | null) {
  return useQuery({
    queryKey: userQueryKey(userId ?? ''),
    queryFn: () => getUser(userId!),
    enabled: !!userId,
  });
}
