'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { useBoardActivityQuery } from '@/lib/queries/activity';
import { useCurrentUserQuery } from '@/lib/queries/users';
import type { ActivityItem } from '@/lib/actions/activity';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import {
  formatRelativeTime,
  getActivityActionText,
  getActivityActionParts,
} from '@/lib/activity-utils';

const linkClass =
  'font-medium text-blue-600 underline hover:text-blue-700';

function ActivityEntry({
  item,
  boardId,
  currentUserId,
}: {
  item: ActivityItem;
  boardId: string;
  currentUserId?: string | null;
}) {
  const userName = item.user?.name ?? 'Someone';
  const avatarColor = getAvatarColor(userName);
  const parts = getActivityActionParts(
    item.type,
    userName,
    item.payload ?? undefined
  );
  const actionText = getActivityActionText(
    item.type,
    userName,
    item.payload ?? undefined
  );
  const cardHref = item.cardId
    ? `/boards/${boardId}?cardId=${item.cardId}`
    : `/boards/${boardId}`;
  const personHref =
    currentUserId && item.userId === currentUserId ? '/profile' : '#';

  return (
    <div className='flex gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors'>
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ${avatarColor}`}
      >
        {item.user?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- user avatar URL
          <img
            src={item.user.avatar}
            alt=''
            className='w-full h-full rounded-full object-cover'
          />
        ) : (
          (userName.charAt(0) ?? '?').toUpperCase()
        )}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm text-foreground leading-tight'>
          {parts ? (
            <>
              <Link href={personHref} className={linkClass}>
                {parts.userNameDisplay}
              </Link>
              {parts.afterName}
              <Link href={cardHref} className={linkClass}>
                {parts.cardDisplay}
              </Link>
              {parts.afterCard}
            </>
          ) : (
            actionText
          )}
        </p>
        <span className='text-xs text-muted-foreground'>
          {formatRelativeTime(item.createdAt)}
        </span>
      </div>
    </div>
  );
}

export interface BoardActivityListProps {
  boardId: string;
  boardTitle: string;
  /** When true, the query runs (e.g. when submenu is open). */
  enabled?: boolean;
}

/**
 * Activity list for the current board. Used inside the board menu submenu.
 */
export function BoardActivityList({
  boardId,
  boardTitle,
  enabled = true,
}: BoardActivityListProps) {
  const { data, isLoading, isError, error } = useBoardActivityQuery(
    boardId,
    enabled
  );
  const { data: currentUser } = useCurrentUserQuery();
  const activities = data?.activities ?? [];

  return (
    <>
      <div className='border-b border-accent px-3 py-2.5 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <LayoutGrid className='w-4 h-4 text-muted-foreground shrink-0' />
          <h3 className='font-semibold text-sm text-foreground truncate'>
            Activity — {boardTitle}
          </h3>
        </div>
        <Link
          href='/activity'
          className='text-xs text-primary hover:underline shrink-0'
        >
          View all
        </Link>
      </div>
      <div className='max-h-[320px] overflow-y-auto'>
        {isLoading && (
          <div className='flex justify-center py-8'>
            <div className='animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full' />
          </div>
        )}
        {isError && (
          <p className='text-sm text-destructive px-3 py-4'>
            {error instanceof Error ? error.message : 'Failed to load activity'}
          </p>
        )}
        {!isLoading && !isError && activities.length === 0 && (
          <p className='text-sm text-muted-foreground px-3 py-6 text-center'>
            No activity on this board yet.
          </p>
        )}
        {!isLoading && !isError && activities.length > 0 && (
          <div className='space-y-0 px-2 py-1'>
            {activities.slice(0, 25).map((item) => (
              <ActivityEntry
                key={item.id}
                item={item}
                boardId={boardId}
                currentUserId={currentUser?.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
