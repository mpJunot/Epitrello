import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TextAlignStart } from 'lucide-react';

interface DescriptionSectionProps {
  cardDescription?: string;
  isEditing: boolean;
  description: string;
  onChange: (v: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function DescriptionSection({
  cardDescription,
  isEditing,
  description,
  onChange,
  onStartEdit,
  onSave,
  onCancel,
  textareaRef,
}: DescriptionSectionProps) {
  return (
    <div>
      <div className='flex items-center gap-2 mb-3'>
        <TextAlignStart className='w-4 h-4 text-trello-text-secondary' />
        <h3 className='text-sm font-semibold text-trello'>Description</h3>
      </div>
      <div className='ml-7'>
        {!isEditing ? (
          <div onClick={onStartEdit} className='cursor-pointer'>
            {cardDescription ? (
              <p className='text-sm text-trello-text-secondary whitespace-pre-wrap px-3 py-2 transition-colors min-h-[80px]'>
                {cardDescription}
              </p>
            ) : (
              <Button
                variant='ghost'
                className='text-sm text-trello-text-secondary w-full justify-start min-h-[80px]'
              >
                Add a more detailed description...
              </Button>
            )}
          </div>
        ) : (
          <div>
            <Textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  onCancel();
                }
              }}
              placeholder='Add a more detailed description...'
              className='w-full min-h-[120px] resize-y'
            />
            <div className='mt-2 flex items-center gap-2'>
              <Button onClick={onSave} size='sm'>
                Save
              </Button>
              <Button onClick={onCancel} variant='secondary' size='sm'>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
