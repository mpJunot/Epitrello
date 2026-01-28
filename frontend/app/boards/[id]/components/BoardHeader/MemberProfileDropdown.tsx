'use client';

import { Pencil, Activity } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import type { BoardMember } from '../../types';

interface MemberProfileDropdownProps {
  member: BoardMember;
}

export function MemberProfileDropdown({ member }: MemberProfileDropdownProps) {
  const displayName = member.user?.name || member.user?.email || 'U';
  const initials = member.user?.name
    ? member.user.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()
    : (member.user?.email?.charAt(0) || 'U').toUpperCase();
  const avatarColor = getAvatarColor(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer hover:opacity-80 transition-opacity">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.user?.avatar ? member.user.avatar : undefined} />
            <AvatarFallback className={`text-xs text-white ${avatarColor}`}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 border-accent">
        {/* Header section with blue background */}
        <div className="bg-blue-600 text-white p-6 relative">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={member.user?.avatar ? member.user.avatar : undefined} />
              <AvatarFallback className={`text-2xl text-white ${avatarColor}`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">
                {member.user?.name || 'Unknown User'}
              </h2>
              <p className="text-blue-100 text-sm">
                @{member.user?.email?.split('@')[0] || 'user'}
              </p>
            </div>
          </div>
        </div>

        {/* Content section with white background */}
        <div className="bg-white p-0">
          <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-none focus:bg-gray-100 cursor-pointer">
            <Pencil className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900">Edit profile info</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-0" />
          <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-none focus:bg-gray-100 cursor-pointer">
            <Activity className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900">View member&apos;s board activity</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
