'use client';

import { MemberProfileDropdown } from './MemberProfileDropdown';
import type { BoardMember } from '../../types';

interface MemberAvatarsProps {
  members: BoardMember[];
}

export function MemberAvatars({ members }: MemberAvatarsProps) {
  return (
    <div className='flex items-center gap-2 ml-2'>
      {members.slice(0, 5).map((member) => (
        <MemberProfileDropdown key={member.id} member={member} />
      ))}
      {members.length > 5 && (
        <div className='h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs text-white'>
          +{members.length - 5}
        </div>
      )}
    </div>
  );
}
