'use client';

import React from 'react';
import Link from 'next/link';
import { useActivityInfiniteQuery } from '@/lib/queries/activity';
import { useCurrentUserQuery } from '@/lib/queries/users';
import type { ActivityItem } from '@/lib/actions/activity';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import {
  formatRelativeTime,
  getActivityActionText,
  getActivityActionParts,
} from '@/lib/activity-utils';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Lock, X } from 'lucide-react';

const linkClass =
  'font-medium text-blue-600 underline hover:text-blue-700';

function ActivityEntry({
  item,
  currentUserId,
}: {
  item: ActivityItem;
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
  const boardTitle = item.board?.title ?? 'Board';
  const boardId = item.boardId;
  const cardHref =
    boardId && item.cardId
      ? `/boards/${boardId}?cardId=${item.cardId}`
      : boardId
        ? `/boards/${boardId}`
        : null;
  const personHref =
    item.userId === currentUserId
      ? '/profile'
      : item.userId
        ? `/users/${item.userId}`
        : '#';

  return (
    <div className='flex gap-3 py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors'>
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${avatarColor}`}
      >
        {item.user?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- user avatar URL, size fixed
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
        <p className='text-sm text-foreground'>
          {parts && cardHref ? (
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
        <div className='flex items-center gap-2 mt-1 text-xs text-muted-foreground'>
          <span>{formatRelativeTime(item.createdAt)}</span>
          <span>·</span>
          <Link
            href={boardId ? `/boards/${boardId}` : '#'}
            className='inline-flex items-center gap-1 hover:text-foreground hover:underline'
          >
            <LayoutGrid className='size-3.5 shrink-0' />
            {boardTitle}
          </Link>
        </div>
      </div>
    </div>
  );
}

export interface ActivityContentProps {
  /** Filter by workspace IDs. Undefined = all workspaces. */
  workspaceIds?: string[];
  /** Subtitle text (e.g. "Workspaces" or workspace name). */
  subtitle: string;
  /** Close / back link URL. */
  backHref: string;
}

export function ActivityContent({
  workspaceIds,
  subtitle,
  backHref,
}: ActivityContentProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useActivityInfiniteQuery(workspaceIds);

  const activities = React.useMemo(
    () => data?.pages.flatMap((p) => p.activities) ?? [],
    [data]
  );
  const { data: currentUser } = useCurrentUserQuery();

  return (
    <div className='h-full bg-background flex flex-col p-4'>
      <div className='p-6 w-full max-w-4xl flex flex-col flex-1 min-h-0 mx-auto'>
        <header className='shrink-0 border-b border-accent pb-4 mb-4 flex items-center justify-between gap-4'>
          <div className='flex flex-col gap-1 min-w-0'>
            <h1 className='text-lg font-semibold text-foreground truncate'>
              Activity
            </h1>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Lock className='size-4 shrink-0' />
              <span className='truncate'>{subtitle}</span>
            </div>
          </div>
          <Link
            href={backHref}
            className='shrink-0 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground'
            aria-label='Close'
          >
            <X className='size-5' />
          </Link>
        </header>

        <main className='flex-1 overflow-auto min-h-0'>
          {isLoading && (
            <div className='flex justify-center py-8'>
              <div className='animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full' />
            </div>
          )}
          {isError && (
            <p className='text-sm text-destructive py-4'>
              {error instanceof Error
                ? error.message
                : 'Failed to load activity'}
            </p>
          )}
          {!isLoading && !isError && activities.length === 0 && (
            <p className='text-sm text-muted-foreground py-8 text-center'>
              No activity yet. Create cards, add comments, or move cards to see
              your activity here.
            </p>
          )}
          {!isLoading && !isError && activities.length > 0 && (
            <div className='space-y-0'>
              {activities.map((item) => (
                <ActivityEntry
                  key={item.id}
                  item={item}
                  currentUserId={currentUser?.id}
                />
              ))}
            </div>
          )}
          {hasNextPage && !isLoading && !isError && (
            <div className='flex justify-center pt-4 pb-2'>
              <Button
                variant='outline'
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <span className='animate-spin mr-2 inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full' />
                    Loading…
                  </>
                ) : (
                  'Load more activity'
                )}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
