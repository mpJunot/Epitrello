'use client';

import React, { useState, useMemo } from 'react';
import { Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import type { UserRef } from './types';

export interface CardModalMembersPopoverProps {
  availableMembers: UserRef[];
  assignedMembers: UserRef[];
  onToggleMember: (member: UserRef) => void;
  trigger: React.ReactNode;
}

interface MemberWithWorkspace extends UserRef {
  workspaceName?: string;
  workspaceId?: string;
}

export function CardModalMembersPopover({
  availableMembers,
  assignedMembers,
  onToggleMember,
  trigger,
}: CardModalMembersPopoverProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const isMemberAssigned = (memberId: string) => {
    return assignedMembers.some((m) => m.id === memberId);
  };

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return availableMembers;
    
    const query = searchQuery.toLowerCase();
    return availableMembers.filter(
      (member) =>
        member.name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
    );
  }, [availableMembers, searchQuery]);

  // Group members by workspace
  const membersByWorkspace = useMemo(() => {
    const grouped: Record<string, { workspaceName: string; members: MemberWithWorkspace[] }> = {};
    
    filteredMembers.forEach((member) => {
      // For now, we'll use a default workspace or extract from member data if available
      // In the future, this should come from the backend (board.workspaceId or member.workspaceId)
      const workspaceName = (member as MemberWithWorkspace).workspaceName || 'Board Members';
      const workspaceId = (member as MemberWithWorkspace).workspaceId || 'default';
      
      if (!grouped[workspaceId]) {
        grouped[workspaceId] = {
          workspaceName,
          members: [],
        };
      }
      grouped[workspaceId].members.push({
        ...member,
        workspaceName,
        workspaceId,
      });
    });

    return grouped;
  }, [filteredMembers]);

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3 border-accent">
        <h4 className="text-sm font-semibold text-trello mb-3">Members</h4>
        
        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-trello-text-secondary" />
          <Input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full"
          />
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
          {Object.entries(membersByWorkspace).map(([workspaceId, { workspaceName, members }]) => (
            <div key={workspaceId} className="space-y-1">
              <div className="text-xs font-semibold text-trello-text-secondary uppercase tracking-wide px-1">
                {workspaceName}
              </div>
              {members.map((member) => {
                const initials = member.name
                  ? member.name
                      .split(' ')
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : (member.email || 'U')[0].toUpperCase();
                const isAssigned = isMemberAssigned(member.id);
                return (
                  <Button
                    key={member.id}
                    onClick={() => onToggleMember(member)}
                    variant="ghost"
                    className={`w-full justify-start ${isAssigned ? 'bg-trello-blue-light hover:bg-trello-blue-light' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0 ${getAvatarColor(member.name || member.email)}`}
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
                    <div className="flex-1 min-w-0 ml-2">
                      <div className="text-sm font-medium text-trello truncate">
                        {member.name}
                      </div>
                      <div className="text-xs text-trello-text-secondary truncate">
                        {member.email}
                      </div>
                    </div>
                    {isAssigned && (
                      <Check className="w-5 h-5 text-trello-blue shrink-0" />
                    )}
                  </Button>
                );
              })}
            </div>
          ))}
          
          {filteredMembers.length === 0 && (
            <div className="text-sm text-trello-text-secondary text-center py-4">
              No members found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
