'use client';

import { useState } from 'react';
import { Board } from '../types';
import { Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VisibilityDropdown } from './BoardHeader/VisibilityDropdown';
import { FilterMenu } from './BoardHeader/FilterMenu';
import { MemberAvatars } from './BoardHeader/MemberAvatars';
import { ShareDialog } from './BoardHeader/ShareDialog';
import { BoardMenu } from './BoardHeader/BoardMenu';

interface BoardHeaderProps {
  board: Board;
  onVisibilityChange?: (visibility: 'PRIVATE' | 'PUBLIC' | 'WORKSPACE') => void;
}

export function BoardHeader({ board, onVisibilityChange }: BoardHeaderProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const boardMembers = board.members || [];

  return (
    <header
      className={`flex items-center justify-between p-3 text-white ${board.background || 'bg-primary'} shadow-lg`}
    >
      {/* Left side: Board title and visibility */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-white">{board.title}</h1>
        <VisibilityDropdown
          visibility={board.visibility}
          onVisibilityChange={onVisibilityChange}
        />
      </div>

      {/* Right side: Actions and members */}
      <div className="flex items-center gap-2">
        <FilterMenu />

        {/* Star */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          title="Star board"
        >
          <Star className="w-5 h-5" />
        </Button>

        <MemberAvatars members={boardMembers} />

        {/* Share button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowShareDialog(true)}
          className="bg-white/20 hover:bg-white/30 text-white border-0"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>

        <BoardMenu board={board} members={boardMembers} lists={board.lists || []} />
      </div>

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        members={boardMembers}
      />
    </header>
  );
}
