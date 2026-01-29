'use client';

import { Calendar, CheckSquare, Paperclip, Tag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRef, DueDate, Label } from './types';
import { LabelsPopover } from './LabelsPopover';
import { CardModalDatesEditPopover } from './CardModalDatesEditPopover';
import { CardModalChecklistPopover } from './CardModalChecklistPopover';
import { CardModalMembersPopover } from './CardModalMembersPopover';

interface CardModalQuickActionsProps {
  availableMembers: UserRef[];
  assignedMembers: UserRef[];
  assignedLabels: Label[];
  boardId: string;
  dueDate?: DueDate;
  startDate?: string;
  selectedDate: string;
  selectedStartDate: string;
  newChecklistTitle: string;
  onToggleMenu: (menuName: string) => void;
  onToggleMember: (member: UserRef) => void;
  onToggleLabel: (label: Label) => void;
  onSetSelectedDate: (date: string) => void;
  onSetSelectedStartDate: (date: string) => void;
  onSaveDueDate: () => void;
  onRemoveDueDate: () => void;
  onSaveStartDate: () => void;
  onRemoveStartDate: () => void;
  onSetNewChecklistTitle: (title: string) => void;
  onCreateChecklist: () => void;
}

export function CardModalQuickActions({
  availableMembers,
  assignedMembers,
  assignedLabels,
  boardId,
  dueDate,
  startDate,
  selectedDate,
  selectedStartDate,
  newChecklistTitle,
  onToggleMenu,
  onToggleMember,
  onToggleLabel,
  onSetSelectedDate,
  onSetSelectedStartDate,
  onSaveDueDate,
  onRemoveDueDate,
  onSaveStartDate,
  onRemoveStartDate,
  onSetNewChecklistTitle,
  onCreateChecklist,
}: CardModalQuickActionsProps) {
  return (
    <div className='flex items-center gap-2 flex-wrap relative'>
      {assignedMembers.length === 0 && (
        <CardModalMembersPopover
          availableMembers={availableMembers}
          assignedMembers={assignedMembers}
          onToggleMember={onToggleMember}
          trigger={
            <Button
              variant='outline'
              size='sm'
              className='text-sm bg-muted hover:bg-muted/80 text-foreground rounded-md'
            >
              <User className='w-4 h-4 mr-1' />
              Members
            </Button>
          }
        />
      )}

      {/* Dates - only show if no dates are defined, use same Popover */}
      {!startDate && !dueDate && (
        <CardModalDatesEditPopover
          startDate={startDate}
          dueDate={dueDate}
          selectedStartDate={selectedStartDate}
          selectedDate={selectedDate}
          onSetSelectedStartDate={onSetSelectedStartDate}
          onSetSelectedDate={onSetSelectedDate}
          onSaveStartDate={onSaveStartDate}
          onRemoveStartDate={onRemoveStartDate}
          onSaveDueDate={onSaveDueDate}
          onRemoveDueDate={onRemoveDueDate}
          trigger={
            <Button
              variant='outline'
              size='sm'
              className='text-sm text-trello-secondary hover:bg-trello-hover'
            >
              <Calendar className='w-4 h-4 mr-1' />
              Dates
            </Button>
          }
        />
      )}

      {/* Labels - only show if no labels are assigned */}
      {assignedLabels.length === 0 && (
        <LabelsPopover
          boardId={boardId}
          assignedLabels={assignedLabels}
          onToggleLabel={onToggleLabel}
          trigger={
            <Button
              variant='outline'
              size='sm'
              className='text-sm bg-muted hover:bg-muted/80 text-foreground rounded-md'
            >
              <Tag className='w-4 h-4 mr-1' />
              Labels
            </Button>
          }
        />
      )}

      {/* Checklist */}
      <CardModalChecklistPopover
        newChecklistTitle={newChecklistTitle}
        onSetNewChecklistTitle={onSetNewChecklistTitle}
        onCreateChecklist={onCreateChecklist}
        trigger={
          <Button
            variant='outline'
            size='sm'
            className='text-sm bg-muted hover:bg-muted/80 text-foreground rounded-md'
          >
            <CheckSquare className='w-4 h-4 mr-1' />
            Checklist
          </Button>
        }
      />

      {/* Attachment */}
      <Button
        variant='outline'
        size='sm'
        className='text-sm bg-muted hover:bg-muted/80 text-foreground rounded-md'
        onClick={() => onToggleMenu('attachment')}
      >
        <Paperclip className='w-4 h-4 mr-1' />
        Attachment
      </Button>
    </div>
  );
}
