'use client';

import { useState } from 'react';
import { Board, BoardFilterState } from '../types';
import { Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterMenu } from './BoardHeader/FilterMenu';
import { MemberAvatars } from './BoardHeader/MemberAvatars';
import { ShareDialog } from './BoardHeader/ShareDialog';
import { BoardMenu } from './BoardHeader/BoardMenu';

interface BoardHeaderProps {
  board: Board;
  canEdit?: boolean;
  onVisibilityChange?: (visibility: 'PRIVATE' | 'PUBLIC' | 'WORKSPACE') => void;
  onMemberAdded?: () => void;
  filterState?: BoardFilterState;
  onFilterChange?: (updates: Partial<BoardFilterState>) => void;
  onClearFilters?: () => void;
  currentUserId?: string | null;

  filteredCardCount?: number;
}

export function BoardHeader({
  board,
  canEdit = true,
  onVisibilityChange,
  onMemberAdded,
  filterState,
  onFilterChange,
  onClearFilters,
  currentUserId,
  filteredCardCount,
}: BoardHeaderProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const boardMembers = board.members || [];

  return (
    <header
      className={`flex items-center justify-between p-3 text-white ${
        board.background || 'bg-primary'
      } shadow-lg`}
    >
      {/* Left side: Board title */}
      <div className='flex items-center gap-3'>
        <h1 className='text-lg font-semibold text-white'>{board.title}</h1>
        {!canEdit && (
          <span className='text-xs text-white/80 bg-white/10 px-2 py-0.5 rounded'>
            View only
          </span>
        )}
      </div>

      {/* Right side: Members, actions */}
      <div className='flex items-center gap-2'>
        <MemberAvatars members={boardMembers} />

        <FilterMenu
          boardId={board.id}
          members={boardMembers}
          filterState={filterState}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          currentUserId={currentUserId}
          filteredCardCount={filteredCardCount}
        />

        {/* Star */}
        <Button
          variant='ghost'
          size='icon'
          className='text-white hover:bg-white/20'
          title='Star board'
        >
          <Star className='w-5 h-5' />
        </Button>

        {/* Share button - only for members who can edit */}
        {canEdit && (
          <Button
            variant='secondary'
            size='sm'
            onClick={() => setShowShareDialog(true)}
            className='bg-trello-blue hover:bg-trello-blue-hover text-white border-0'
          >
            <Share2 className='w-4 h-4 mr-1' />
            Share
          </Button>
        )}

        <BoardMenu
          board={board}
          members={boardMembers}
          lists={board.lists || []}
          canEdit={canEdit}
          onVisibilityChange={onVisibilityChange}
          currentUserId={currentUserId}
        />
      </div>

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        boardId={board.id}
        members={boardMembers}
        onMemberAdded={onMemberAdded}
      />
    </header>
  );
}
