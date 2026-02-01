import React from 'react';
import { Label, UserRef, DueDate } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label as LabelUI } from '@/components/ui/label';
import { Users, Tag, CheckSquare, Calendar, Check } from 'lucide-react';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { getLabelDisplayColor } from '@/lib/constants/label-colors';

interface AddToCardMenuProps {
  openMenu: string | null;
  toggleMenu: (menu: string) => void;
  registerMenuRef: (key: string, el: HTMLDivElement | null) => void;

  availableMembers: UserRef[];
  isMemberAssigned: (id: string) => boolean;
  toggleMember: (member: UserRef) => void;

  availableLabels: Label[];
  isLabelAssigned: (id: string) => boolean;
  toggleLabel: (label: Label) => void;

  newChecklistTitle: string;
  setNewChecklistTitle: (v: string) => void;
  createChecklist: () => void;

  selectedDate: string;
  setSelectedDate: (v: string) => void;
  dueDate?: DueDate;
  saveDueDate: () => void;
  removeDueDate: () => void;
}

export default function AddToCardMenu({
  openMenu,
  toggleMenu,
  registerMenuRef,
  availableMembers,
  isMemberAssigned,
  toggleMember,
  availableLabels,
  isLabelAssigned,
  toggleLabel,
  newChecklistTitle,
  setNewChecklistTitle,
  createChecklist,
  selectedDate,
  setSelectedDate,
  dueDate,
  saveDueDate,
  removeDueDate,
}: AddToCardMenuProps) {
  return (
    <div>
      <h3 className='text-xs font-semibold text-trello-text-secondary uppercase tracking-wide mb-2'>
        Add to card
      </h3>
      <div className='space-y-2'>
        <div className='relative' ref={(el) => registerMenuRef('members', el)}>
          <Button
            onClick={() => toggleMenu('members')}
            variant='ghost'
            className='w-full justify-start'
          >
            <Users className='w-4 h-4' />
            Members
          </Button>
          {openMenu === 'members' && (
            <div className='absolute top-full left-0 mt-1 w-64 bg-trello-card-bg rounded-lg shadow-xl border border-accent p-3 z-10 animate-fade-in'>
              <h4 className='text-sm font-semibold text-trello mb-2'>
                Members
              </h4>
              <div className='space-y-1 max-h-64 overflow-y-auto custom-scrollbar'>
                {availableMembers.map((member) => {
                  const initials = member.name
                    ? member.name
                        .split(' ')
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join('')
                    : (member.email || 'U')[0].toUpperCase();
                  const isAssigned = isMemberAssigned(member.id);
                  return (
                    <Button
                      key={member.id}
                      onClick={() => toggleMember(member)}
                      variant='ghost'
                      className={`w-full justify-start ${isAssigned ? 'bg-trello-blue-light hover:bg-trello-blue-light' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${getAvatarColor(member.name || member.email)}`}
                      >
                        {member.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className='w-full h-full object-cover rounded-full'
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm font-medium text-trello truncate'>
                          {member.name}
                        </div>
                        <div className='text-xs text-trello-text-secondary truncate'>
                          {member.email}
                        </div>
                      </div>
                      {isAssigned && (
                        <Check className='w-5 h-5 text-trello-blue shrink-0' />
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className='relative' ref={(el) => registerMenuRef('labels', el)}>
          <Button
            onClick={() => toggleMenu('labels')}
            variant='ghost'
            className='w-full justify-start'
          >
            <Tag className='w-4 h-4' />
            Labels
          </Button>
          {openMenu === 'labels' && (
            <div className='absolute top-full left-0 mt-1 w-64 bg-trello-card-bg rounded-lg shadow-xl border border-accent p-3 z-10 animate-fade-in'>
              <h4 className='text-sm font-semibold text-trello mb-3'>Labels</h4>
              <div className='space-y-2 max-h-64 overflow-y-auto custom-scrollbar'>
                {availableLabels.map((label) => {
                  const isAssigned = isLabelAssigned(label.id);
                  return (
                    <Button
                      key={label.id}
                      onClick={() => toggleLabel(label)}
                      variant='ghost'
                      className={`w-full justify-start text-white hover:opacity-90 ${isAssigned ? 'ring-2 ring-trello-blue ring-offset-2' : ''}`}
                      style={{
                        backgroundColor: getLabelDisplayColor(label.color),
                      }}
                    >
                      <span className='flex-1 text-left'>
                        {label.name || 'Untitled'}
                      </span>
                      {isAssigned && <Check className='w-5 h-5 shrink-0' />}
                    </Button>
                  );
                })}
              </div>
              <div className='mt-3 pt-3 border-t border-accent'>
                <Button variant='ghost' className='w-full justify-start'>
                  Create new label
                </Button>
              </div>
            </div>
          )}
        </div>

        <div
          className='relative'
          ref={(el) => registerMenuRef('checklist', el)}
        >
          <Button
            onClick={() => toggleMenu('checklist')}
            variant='ghost'
            className='w-full justify-start'
          >
            <CheckSquare className='w-4 h-4' />
            Checklist
          </Button>
          {openMenu === 'checklist' && (
            <div className='absolute top-full left-0 mt-1 w-64 bg-trello-card-bg rounded-lg shadow-xl border border-accent p-3 z-10 animate-fade-in'>
              <h4 className='text-sm font-semibold text-trello mb-2'>
                Add Checklist
              </h4>
              <Input
                type='text'
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    createChecklist();
                  } else if (e.key === 'Escape') {
                    toggleMenu('checklist');
                    setNewChecklistTitle('');
                  }
                }}
                placeholder='Checklist title...'
                className='mb-2'
              />
              <Button onClick={createChecklist} className='w-full' size='sm'>
                Add
              </Button>
            </div>
          )}
        </div>

        <div className='relative' ref={(el) => registerMenuRef('dates', el)}>
          <Button
            onClick={() => toggleMenu('dates')}
            variant='ghost'
            className='w-full justify-start'
          >
            <Calendar className='w-4 h-4' />
            Dates
          </Button>
          {openMenu === 'dates' && (
            <div className='absolute top-full left-0 mt-1 w-64 bg-trello-card-bg rounded-lg shadow-xl border border-accent p-3 z-10 animate-fade-in'>
              <h4 className='text-sm font-semibold text-trello mb-3'>Dates</h4>
              <LabelUI className='block text-xs mb-1'>Due date</LabelUI>
              <Input
                type='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className='mb-3'
              />
              <Button
                onClick={saveDueDate}
                disabled={!selectedDate}
                className='w-full'
                size='sm'
              >
                Save
              </Button>
              {dueDate && (
                <Button
                  onClick={removeDueDate}
                  variant='destructive'
                  className='w-full mt-2'
                  size='sm'
                >
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
