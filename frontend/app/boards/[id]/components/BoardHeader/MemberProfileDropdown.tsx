'use client';

import Link from 'next/link';
import { Activity, Crown, User, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
} from '@/components/ui/avatar';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import type { BoardMember } from '../../types';

interface MemberProfileDropdownProps {
  member: BoardMember;
}

export function MemberProfileDropdown({ member }: MemberProfileDropdownProps) {
  const displayName = member.user?.name || member.user?.email || 'U';
  const initials = member.user?.name
    ? member.user.name
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (member.user?.email?.charAt(0) || 'U').toUpperCase();
  const avatarColor = getAvatarColor(displayName);
  const isAdmin = member.role === 'ADMIN';
  const handle = member.user?.email
    ? `@${member.user.email.split('@')[0]}`
    : '@user';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='cursor-pointer hover:opacity-80 transition-opacity relative h-8 w-8 shrink-0'>
          <Avatar className='h-8 w-8'>
            <AvatarImage
              src={member.user?.avatar ? member.user.avatar : undefined}
              className='object-cover'
            />
            <AvatarFallback className={`text-xs text-white ${avatarColor}`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          {isAdmin && (
            <AvatarBadge title='Admin' className='bg-amber-500/90 ring-0'>
              <Crown className='size-2.5 text-white' />
            </AvatarBadge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='border-none p-0 w-80 overflow-hidden'
      >
        {/* Header: light blue, avatar + name + handle, close X */}
        <div className='bg-trello-blue text-white p-5 pr-10 relative'>
          <DropdownMenuItem className='absolute right-2 top-2 p-1.5 rounded-md hover:bg-white/20 focus:bg-white/20 cursor-pointer'>
            <X className='size-5' />
          </DropdownMenuItem>
          <div className='flex items-center gap-4'>
            <Avatar className='h-16 w-16 shrink-0'>
              <AvatarImage
                src={member.user?.avatar ? member.user.avatar : undefined}
                className='object-cover'
              />
              <AvatarFallback className={`text-xl text-white ${avatarColor}`}>
                {initials}
              </AvatarFallback>
              {isAdmin && (
                <AvatarBadge
                  title='Admin'
                  className='bg-amber-500/90 ring-1 ring-trello-blue'
                >
                  <Crown className='size-2.5 text-white' />
                </AvatarBadge>
              )}
            </Avatar>
            <div className='min-w-0'>
              <h2 className='text-xl font-semibold truncate'>
                {member.user?.name || 'Unknown User'}
              </h2>
              <p className='text-white/80 text-sm truncate'>{handle}</p>
            </div>
          </div>
        </div>

        {/* Body: dark gray, description then actions */}
        <div className='bg-trello-card-bg text-trello p-0'>
          <p className='px-4 py-3 text-sm text-trello-text-secondary border-b border-accent'>
            {member.user?.description || ''}
          </p>
          <DropdownMenuSeparator className='my-0' />
          {member.user?.id && (
            <DropdownMenuItem asChild>
              <Link
                href={`/users/${member.user.id}`}
                className='flex items-center gap-3 px-4 py-3 hover:bg-trello-hover rounded-none focus:bg-trello-hover cursor-pointer'
              >
                <User className='w-5 h-5 text-trello-text-secondary shrink-0' />
                <span>View profile</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className='my-0' />
          <DropdownMenuItem asChild>
            <Link
              href='/activity'
              className='flex items-center gap-3 px-4 py-3 hover:bg-trello-hover rounded-none focus:bg-trello-hover cursor-pointer'
            >
              <Activity className='w-5 h-5 text-trello-text-secondary shrink-0' />
              <span>View activity</span>
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
