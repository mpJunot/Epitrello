'use client';

import React, { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import type { UserRef } from './types';

const avatarSizeClasses = 'h-9 w-9';

export interface CardModalMembersProps {
  availableMembers: UserRef[];
  assignedMembers: UserRef[];
  onToggleMember: (member: UserRef) => void;
}

function filterBySearch(members: UserRef[], q: string): UserRef[] {
  if (!q.trim()) return members;
  const lower = q.trim().toLowerCase();
  return members.filter(
    (m) =>
      (m.name || '').toLowerCase().includes(lower) ||
      (m.email || '').toLowerCase().includes(lower),
  );
}

export function CardModalMembers({
  availableMembers,
  assignedMembers,
  onToggleMember,
}: CardModalMembersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredMembers = useMemo(
    () => filterBySearch(availableMembers, searchQuery),
    [availableMembers, searchQuery],
  );
  const isAssigned = (id: string) => assignedMembers.some((m) => m.id === id);

  return (
    <div className='space-y-4'>
      <Label className='text-base font-semibold block'>Members</Label>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
        <Input
          type='search'
          placeholder='Search members...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='pl-9 w-full bg-muted/30 border-accent focus-visible:ring-2 focus-visible:ring-primary/20'
        />
      </div>
      <div className='space-y-1 max-h-64 overflow-y-auto'>
        {filteredMembers.length === 0 ? (
          <p className='text-sm text-muted-foreground py-2 text-center'>
            {searchQuery.trim()
              ? 'No members match your search.'
              : 'No members found.'}
          </p>
        ) : (
          <ItemGroup className='gap-1'>
            {filteredMembers.map((member) => {
              const assigned = isAssigned(member.id);
              const displayName = member.name || member.email || 'U';
              const avatarColor = getAvatarColor(displayName);
              return (
                <Item
                  key={member.id}
                  asChild
                  size='sm'
                  variant='outline'
                  className='cursor-pointer min-w-0 border-accent'
                >
                  <div
                    role='button'
                    tabIndex={0}
                    onClick={() => onToggleMember(member)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggleMember(member);
                      }
                    }}
                  >
                    <ItemMedia
                      variant='default'
                      className='p-0 self-center flex items-center'
                    >
                      <span
                        onClick={(e) => e.stopPropagation()}
                        className='shrink-0 flex items-center justify-center'
                      >
                        <Checkbox
                          checked={assigned}
                          onCheckedChange={() => onToggleMember(member)}
                          aria-label={
                            assigned ? 'Remove member' : 'Assign member'
                          }
                        />
                      </span>
                    </ItemMedia>
                    <ItemMedia
                      variant='default'
                      className='p-0 self-center flex items-center justify-center'
                    >
                      <Avatar
                        className={cn(
                          'shrink-0 flex items-center justify-center',
                          avatarSizeClasses,
                        )}
                      >
                        <AvatarImage
                          src={member.avatar ?? undefined}
                          alt={displayName}
                          className='object-cover'
                        />
                        <AvatarFallback
                          className={cn(
                            'text-xs font-medium text-white flex items-center justify-center',
                            avatarColor,
                          )}
                        >
                          {getInitials(member.name, member.email)}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className='truncate'>
                        {member.name || member.email}
                      </ItemTitle>
                      {member.email && (
                        <ItemDescription className='line-clamp-1 truncate'>
                          {member.email}
                        </ItemDescription>
                      )}
                    </ItemContent>
                  </div>
                </Item>
              );
            })}
          </ItemGroup>
        )}
      </div>
    </div>
  );
}
