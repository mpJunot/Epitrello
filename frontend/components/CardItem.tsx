'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Clock, CheckSquare, TextAlignStart } from 'lucide-react';
import CardModal from './CardModal';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { LabelBadge } from '@/components/LabelBadge';
import { useAllUserBoards } from '@/app/boards/[id]/hooks';
import type { UserRef, Card } from './types';
import Image from 'next/image';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function MemberAvatar({ user }: { user: UserRef }) {
  const displayName = user.name || user.email || 'U';
  const initials = user.name
    ? user.name
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (user.email || 'U')[0].toUpperCase();
  const avatarColor = getAvatarColor(displayName);
  return (
    <Avatar
      size='sm'
      title={user.name || user.email}
      className={`shrink-0 overflow-hidden rounded-full ${avatarColor}`}
    >
      <AvatarImage
        src={user.avatar ?? undefined}
        alt={user.name ?? 'Avatar'}
        className='object-cover'
      />
      <AvatarFallback className={`${avatarColor} text-xs text-white`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export default function CardItem({
  card,
  index,
  onDragStart,
  onDragOver,
  availableLists = [],
  currentBoardId,
  readOnly = false,
  dragHandleProps,
}: {
  card: Card;
  index?: number;
  onDragStart?: (
    e: React.DragEvent,
    cardId: string,
    fromIndex?: number,
  ) => void;
  onDragOver?: (e: React.DragEvent, overIndex?: number) => void;
  availableLists?: Array<{ id: string; name: string }>;
  currentBoardId?: string;
  readOnly?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const useDndKit = !!dragHandleProps;
  const [isHovering, setIsHovering] = useState(false);
  const propCompleted = card.completed ?? false;
  const [optimisticCompleted, setOptimisticCompleted] = useState<
    boolean | null
  >(null);
  const localCompleted =
    optimisticCompleted !== null ? optimisticCompleted : propCompleted;
  const cardRef = useRef<HTMLDivElement>(null);
  const { allBoards } = useAllUserBoards();

  useEffect(() => {
    console.log('🃏 CardItem: card prop changed:', {
      id: card.id,
      title: card.title,
    });
  }, [card, card.id, card.title]);

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      return;
    }
    setIsModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (useDndKit) return;
    if (card.id.startsWith('temp-')) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    e.stopPropagation();
    if (onDragStart) {
      onDragStart(e, card.id, index);
    }

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (useDndKit) return;
    setIsDragging(false);

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
      e.currentTarget.classList.remove('opacity-70', 'scale-105');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (useDndKit) return;
    e.preventDefault();
    e.stopPropagation();
    if (onDragOver) {
      onDragOver(e, index);
    }
  };

  const handleCompletedChange = (checked: boolean) => {
    setOptimisticCompleted(checked);
    window.dispatchEvent(
      new CustomEvent('epitrello:card-completed-updated', {
        detail: {
          cardId: card.id,
          completed: checked,
        },
      }),
    );
  };

  const isOverdue =
    card.dueDate && new Date(card.dueDate) < new Date() && !localCompleted;

  return (
    <>
      <div
        ref={cardRef}
        draggable={
          !useDndKit &&
          !readOnly &&
          !isModalOpen &&
          !card.id.startsWith('temp-')
        }
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`bg-secondary dark:bg-card border rounded-lg select-none transition-all duration-200 overflow-hidden ${
          card.id.startsWith('temp-')
            ? 'opacity-60 cursor-not-allowed border-accent'
            : `hover:cursor-pointer border-accent hover:border-blue-500 ${
                isDragging ? 'opacity-40' : ''
              }`
        } ${localCompleted ? 'opacity-70' : ''}`}
        onClick={handleClick}
        tabIndex={0}
        title={card.id.startsWith('temp-') ? 'Saving card...' : undefined}
        {...(dragHandleProps ?? {})}
      >
        {card.background &&
          (card.background.startsWith('data:image') ||
            card.background.startsWith('http') ||
            card.background.startsWith('https')) && (
            <div className='relative w-full h-32'>
              <Image
                src={card.background}
                fill
                alt='Card background'
                className='object-contain'
              />
            </div>
          )}
        {card.background &&
          !card.background.startsWith('data:image') &&
          !card.background.startsWith('http') &&
          !card.background.startsWith('https') && (
            <div className={`h-8 w-full ${card.background}`} />
          )}
        <div className='p-3'>
          {(card.labels ?? []).length > 0 && (
            <div className='flex h-5 w-full overflow-hidden items-center gap-1.5'>
              {(card.labels ?? []).map((label) => (
                <LabelBadge key={label.id} label={label} variant='dot' />
              ))}
            </div>
          )}

          <div className='flex flex-col gap-2'>
            <div className='relative flex items-center min-h-5'>
              <div
                className={`shrink-0 overflow-hidden transition-[width,opacity,transform] duration-200 ease-out flex items-center justify-center ${
                  isHovering || localCompleted
                    ? 'opacity-100 translate-x-0 w-4 min-w-4'
                    : 'opacity-0 -translate-x-3 w-0 min-w-0 pointer-events-none'
                }`}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={localCompleted}
                  onCheckedChange={handleCompletedChange}
                  className='rounded-full transition-[box-shadow,background-color,border-color] duration-150 ease-out'
                  aria-label={
                    localCompleted
                      ? 'Mark as not completed'
                      : 'Mark as completed'
                  }
                />
              </div>
              <div
                className={`font-medium text-sm leading-5 text-foreground transition-[transform] duration-200 ease-out flex-1 min-w-0 ${
                  isHovering || localCompleted
                    ? 'translate-x-2'
                    : 'translate-x-0'
                } ${localCompleted ? 'line-through opacity-60' : ''}`}
              >
                {card.title}
              </div>
            </div>

            {/* Dates (clock icon) */}
            {(card.startDate || card.dueDate) && (
              <div
                className={`flex items-center p-1 gap-1.5 text-xs rounded-sm flex-wrap ${
                  !localCompleted && isOverdue
                    ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                    : 'text-muted-foreground'
                }`}
              >
                <Clock className='w-3.5 h-3.5 shrink-0' />
                <span>
                  {card.startDate && card.dueDate
                    ? `${formatDate(card.startDate)} → ${formatDate(
                        card.dueDate,
                      )}`
                    : card.dueDate
                      ? `Due: ${formatDate(card.dueDate)}`
                      : `Start: ${formatDate(card.startDate!)}`}
                </span>
                {localCompleted && (
                  <span className='bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-medium'>
                    Completed
                  </span>
                )}
              </div>
            )}

            {/* Description icon (same as CardModal) */}
            {card.description?.trim() && (
              <div
                className={`flex items-center gap-1.5 text-xs text-muted-foreground ${
                  localCompleted ? 'line-through opacity-60' : ''
                }`}
                title='Has description'
              >
                <TextAlignStart className='w-3.5 h-3.5 shrink-0' />
              </div>
            )}

            {/* Checklist (checked/total) */}
            {(() => {
              const total = (card.checklists ?? []).reduce(
                (s, cl) => s + (cl.items?.length ?? 0),
                0,
              );
              const checked = (card.checklists ?? []).reduce(
                (s, cl) => s + (cl.items?.filter((i) => i.checked).length ?? 0),
                0,
              );
              return total > 0 ? (
                <div
                  className={`flex items-center gap-1.5 text-xs text-muted-foreground ${
                    localCompleted ? 'line-through opacity-60' : ''
                  }`}
                >
                  <CheckSquare className='w-3.5 h-3.5 shrink-0' />
                  <span>
                    {checked}/{total}
                  </span>
                </div>
              ) : null;
            })()}

            {/* Members */}
            {(card.assignees || []).length > 0 && (
              <div className='flex justify-end'>
                <AvatarGroup className='flex-row'>
                  {(card.assignees || []).slice(0, 4).map((u: UserRef) => (
                    <MemberAvatar key={u.id} user={u} />
                  ))}
                  {(card.assignees || []).length > 4 && (
                    <AvatarGroupCount>
                      +{(card.assignees || []).length - 4}
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>
              </div>
            )}
          </div>
        </div>
      </div>

      <CardModal
        card={card}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => cardRef.current?.focus(), 0);
        }}
        availableLists={availableLists}
        currentBoardId={currentBoardId}
        availableBoards={allBoards}
        readOnly={readOnly}
      />
    </>
  );
}
