'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import type { UserRef } from './types';

export interface CardModalMembersProps {
  assignedMembers: UserRef[];
  onOpenMembersMenu: () => void;
}

export function CardModalMembers({
  assignedMembers,
  onOpenMembersMenu,
}: CardModalMembersProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-trello mb-2">Members</h3>
      <div className="flex flex-wrap items-center gap-2">
        {assignedMembers.map((member) => {
          const initials = member.name
            ? member.name
                .split(' ')
                .map((s) => s[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
            : (member.email || 'U')[0].toUpperCase();
          return (
            <div
              key={member.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0 ${getAvatarColor(member.name || member.email)}`}
              title={member.name || member.email}
            >
              {member.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                initials
              )}
            </div>
          );
        })}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 shrink-0 rounded-full bg-trello-hover hover:bg-trello-border text-trello-secondary"
          onClick={onOpenMembersMenu}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
