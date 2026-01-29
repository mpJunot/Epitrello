'use client';

import { AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { MemberProfileDropdown } from './MemberProfileDropdown';
import type { BoardMember } from '../../types';

interface MemberAvatarsProps {
  members: BoardMember[];
}

const MAX_VISIBLE = 5;

export function MemberAvatars({ members }: MemberAvatarsProps) {
  const visible = members.slice(0, MAX_VISIBLE);
  const overflowCount = members.length - MAX_VISIBLE;

  return (
    <div className='flex items-center ml-2'>
      <AvatarGroup>
        {visible.map((member) => (
          <MemberProfileDropdown key={member.id} member={member} />
        ))}
        {overflowCount > 0 && (
          <AvatarGroupCount className='bg-trello-card-bg text-trello-text-secondary -ml-2'>
            +{overflowCount}
          </AvatarGroupCount>
        )}
      </AvatarGroup>
    </div>
  );
}
