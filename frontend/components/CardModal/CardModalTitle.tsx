'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface CardModalTitleProps {
  cardTitle: string;
  cardCompleted: boolean;
  isEditing: boolean;
  title: string;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  onTitleChange: (value: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onCompletedChange: (checked: boolean) => void;
}

export function CardModalTitle({
  cardTitle,
  cardCompleted,
  isEditing,
  title,
  titleInputRef,
  onTitleChange,
  onStartEdit,
  onSave,
  onCancel,
  onCompletedChange,
}: CardModalTitleProps) {
  return (
    <div className='border-b border-accent shrink-0'>
      <div className='flex items-start gap-3 mb-4'>
        <Checkbox checked={cardCompleted} onCheckedChange={onCompletedChange} />
        <div className='flex-1 min-w-0'>
          {!isEditing ? (
            <h2
              className='text-xl font-semibold text-trello cursor-pointer hover:bg-trello-hover px-2 py-1 -mx-2 -my-1 rounded transition-colors'
              onClick={onStartEdit}
              title='Click to edit title'
            >
              {cardTitle}
            </h2>
          ) : (
            <Input
              ref={titleInputRef}
              type='text'
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={onSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSave();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  onCancel();
                }
              }}
              className='w-full text-xl font-semibold text-trello px-2 py-1 -mx-2 -my-1 border-2 border-trello-blue h-auto'
              aria-label='Edit card title'
            />
          )}
        </div>
      </div>
    </div>
  );
}
