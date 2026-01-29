'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface MemberItemUser {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  description?: string | null;
  role?: string | null;
}

export interface MemberItemProps {
  /** Member or user with id, name, email, avatar */
  user: MemberItemUser;
  /** Optional content on the right (e.g. Select, Button) */
  actions?: React.ReactNode;
  /** Avatar size: sm (8), default (9), lg (10) */
  avatarSize?: 'sm' | 'default' | 'lg';
  /** Item variant */
  variant?: 'default' | 'outline' | 'muted';
  className?: string;
}

const avatarSizeClasses = {
  sm: 'h-8 w-8',
  default: 'h-9 w-9',
  lg: 'h-10 w-10',
};

/**
 * Reusable row: avatar (initials or image) + name + email.
 * Uses chadcn Item components. Use in member lists, share dialogs, card assignees, etc.
 */
export function MemberItem({
  user,
  actions,
  avatarSize = 'default',
  variant = 'default',
  className,
}: MemberItemProps) {
  const displayName = user.name || user.email || 'U';
  const avatarColor = getAvatarColor(displayName);

  return (
    <Item
      size='sm'
      variant={variant}
      className={cn(
        'rounded-md hover:bg-accent/50 transition-colors cursor-default min-w-0 border-accent',
        className,
      )}
    >
      <ItemMedia variant='default' className='p-0'>
        <Avatar
          className={cn(
            'shrink-0 flex items-center justify-center',
            avatarSizeClasses[avatarSize],
          )}
        >
          <AvatarImage
            src={user.avatar ?? undefined}
            alt={displayName}
            className='object-cover'
          />
          <AvatarFallback
            className={cn(
              'text-xs font-medium text-white flex items-center justify-center',
              avatarColor,
            )}
          >
            {getInitials(user.name, user.email)}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle className='truncate'>{user.name || user.email}</ItemTitle>
        {(user.description ?? user.email) && (
          <ItemDescription className='line-clamp-1 truncate'>
            {user.description ?? user.email}
          </ItemDescription>
        )}
      </ItemContent>
      {(user.role === 'ADMIN' || actions != null) && (
        <ItemActions className='gap-2'>
          {user.role === 'ADMIN' && (
            <span
              className='shrink-0 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400'
              title='Admin'
            >
              Admin
            </span>
          )}
          {actions}
        </ItemActions>
      )}
    </Item>
  );
}
