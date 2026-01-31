'use client';

import { useState } from 'react';
import {
  ListFilter,
  Tag,
  Calendar,
  User,
  Clock,
  ChevronDown,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type {
  BoardFilterState,
  DueDateFilterKind,
  CardStatusFilter,
} from '../../types';
import type { BoardMember } from '../../types';
import { hasActiveFilter } from '../../types';
import { useBoardLabelsQuery } from '@/lib/queries/labels';
import { getLabelDisplayColor } from '@/lib/constants/label-colors';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { cn } from '@/lib/utils';

export interface FilterMenuProps {
  boardId: string;
  members: BoardMember[];
  filterState?: BoardFilterState;
  onFilterChange?: (updates: Partial<BoardFilterState>) => void;
  onClearFilters?: () => void;
  currentUserId?: string | null;
  /** Nombre de cartes affichées (après filtres) pour l’affichage dans le trigger. */
  filteredCardCount?: number;
}

const DUE_DATE_OPTIONS: {
  kind: DueDateFilterKind;
  label: string;
  icon: React.ReactNode;
  iconClass?: string;
}[] = [
  { kind: 'noDate', label: 'No dates', icon: <Calendar className='size-4' /> },
  {
    kind: 'overdue',
    label: 'Overdue',
    icon: <Clock className='size-4 text-red-500' />,
  },
  {
    kind: 'dueNextDay',
    label: 'Due in the next day',
    icon: <Clock className='size-4 text-amber-500' />,
  },
  {
    kind: 'dueNextWeek',
    label: 'Due in the next week',
    icon: <Clock className='size-4 text-amber-500' />,
  },
  {
    kind: 'dueNextMonth',
    label: 'Due in the next month',
    icon: <Clock className='size-4 text-amber-500' />,
  },
];

export function FilterMenu({
  boardId,
  members,
  filterState,
  onFilterChange,
  onClearFilters,
  currentUserId,
  filteredCardCount = 0,
}: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const [selectMembersOpen, setSelectMembersOpen] = useState(false);
  const [selectLabelsOpen, setSelectLabelsOpen] = useState(false);
  const { data: labelsData = [] } = useBoardLabelsQuery(boardId, open);
  const labels = labelsData.map((l) => ({
    id: l.id,
    name: l.name ?? '',
    color: l.color,
  }));

  const safeFilter: BoardFilterState = filterState ?? {
    keyword: '',
    noMembers: false,
    assignedToMe: false,
    memberIds: [],
    labelIds: [],
    noLabels: false,
    cardStatus: null,
    dueDateFilters: [],
  };
  const active = hasActiveFilter(safeFilter);

  const update = (updates: Partial<BoardFilterState>) => {
    onFilterChange?.({ ...safeFilter, ...updates });
  };

  const setKeyword = (keyword: string) => update({ keyword });
  const setNoMembers = (v: boolean) => update({ noMembers: v });
  const setAssignedToMe = (v: boolean) => update({ assignedToMe: v });
  const toggleMember = (userId: string) => {
    const next = safeFilter.memberIds.includes(userId)
      ? safeFilter.memberIds.filter((id) => id !== userId)
      : [...safeFilter.memberIds, userId];
    update({ memberIds: next });
  };
  const selectAllMembers = (checked: boolean) => {
    update({
      memberIds: checked ? members.map((m) => m.userId) : [],
    });
  };
  const allMembersSelected =
    members.length > 0 && safeFilter.memberIds.length === members.length;

  const setNoLabels = (v: boolean) => update({ noLabels: v });
  const toggleLabel = (labelId: string) => {
    const next = safeFilter.labelIds.includes(labelId)
      ? safeFilter.labelIds.filter((id) => id !== labelId)
      : [...safeFilter.labelIds, labelId];
    update({ labelIds: next });
  };
  const selectAllLabels = (checked: boolean) => {
    update({
      labelIds: checked ? labels.map((l) => l.id) : [],
    });
  };
  const allLabelsSelected =
    labels.length > 0 && safeFilter.labelIds.length === labels.length;
  const setCardStatus = (v: CardStatusFilter) => update({ cardStatus: v });
  const toggleDueDate = (kind: DueDateFilterKind) => {
    const next = safeFilter.dueDateFilters.includes(kind)
      ? safeFilter.dueDateFilters.filter((k) => k !== kind)
      : [...safeFilter.dueDateFilters, kind];
    update({ dueDateFilters: next });
  };

  const handleClearAll = () => {
    onClearFilters?.();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {active ? (
        <div className='flex items-center gap-1 rounded-md bg-white/10 text-white overflow-hidden'>
          <PopoverTrigger asChild>
            <button
              type='button'
              className='flex items-center gap-2 pl-2.5 pr-2 py-1.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-l-md'
              title='Filter cards'
            >
              <ListFilter className='size-5 shrink-0' />
              <span className='flex items-center gap-1.5 min-w-6 justify-center rounded-full bg-white/20 text-white text-xs font-medium pl-1 pr-1.5 py-0.5'>
                <span
                  className='size-2 rounded-full bg-primary shrink-0'
                  aria-hidden
                />
                {filteredCardCount}
              </span>
            </button>
          </PopoverTrigger>
          <button
            type='button'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearAll();
            }}
            className='px-3 py-1.5 text-sm font-medium hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
          >
            Clear all
          </button>
        </div>
      ) : (
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='text-white hover:bg-white/20'
            title='Filter cards'
          >
            <ListFilter className='w-5 h-5' />
          </Button>
        </PopoverTrigger>
      )}
      <PopoverContent
        align='end'
        side='bottom'
        className='w-[400px] max-h-[85vh] overflow-y-auto p-2 border-accent scrollbar-hidden'
      >
        <div className='flex items-center justify-between px-4 py-3'>
          <h2 className='text-lg font-semibold text-foreground'>Filter</h2>
          <Button
            variant='ghost'
            size='icon'
            className='size-8 shrink-0'
            onClick={() => setOpen(false)}
            aria-label='Close filter'
          >
            <X className='size-4' />
          </Button>
        </div>
        <div className='flex flex-col gap-6 p-4'>
          {/* Keyword */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-foreground'>
              Keyword
            </Label>
            <Input
              placeholder='Enter a keyword...'
              value={safeFilter.keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='border-accent'
            />
            <p className='text-xs text-muted-foreground'>
              Search cards, members, labels, and more.
            </p>
          </div>

          {/* Members */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium text-foreground'>
              Members
            </Label>
            <div className='flex flex-col gap-2'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <Checkbox
                  checked={safeFilter.noMembers}
                  onCheckedChange={(c) => setNoMembers(!!c)}
                />
                <User className='size-4 text-muted-foreground' />
                <span className='text-sm'>No members</span>
              </label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <Checkbox
                  checked={safeFilter.assignedToMe}
                  onCheckedChange={(c) => setAssignedToMe(!!c)}
                />
                {currentUserId ? (
                  (() => {
                    const me = members.find((m) => m.userId === currentUserId);
                    const displayName =
                      me?.user?.name ?? me?.user?.email ?? 'Me';
                    const initials = me?.user?.name
                      ? me.user.name
                          .split(' ')
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                      : (me?.user?.email?.charAt(0) ?? 'L').toUpperCase();
                    const avatarColor = getAvatarColor(displayName);
                    return (
                      <Avatar className='size-6 shrink-0'>
                        <AvatarImage src={me?.user?.avatar ?? undefined} />
                        <AvatarFallback
                          className={cn('text-[10px] text-white', avatarColor)}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })()
                ) : (
                  <Avatar className='size-6 shrink-0'>
                    <AvatarFallback className='bg-amber-500 text-[10px] text-white'>
                      L
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className='text-sm'>Cards assigned to me</span>
              </label>
              <div className='flex items-center gap-2'>
                <label className='flex cursor-pointer items-center gap-2 shrink-0'>
                  <Checkbox
                    checked={allMembersSelected}
                    onCheckedChange={(c) => selectAllMembers(!!c)}
                  />
                </label>
                <Popover
                  open={selectMembersOpen}
                  onOpenChange={setSelectMembersOpen}
                >
                  <PopoverTrigger asChild>
                    <button
                      type='button'
                      className='flex flex-1 min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    >
                      <span>Select members</span>
                      <ChevronDown className='size-4 shrink-0 text-muted-foreground' />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align='start'
                    className='w-[320px] max-h-[280px] overflow-y-auto p-2 border-accent scrollbar-hidden'
                  >
                    {members.length === 0 ? (
                      <p className='px-2 py-3 text-xs text-muted-foreground'>
                        No members
                      </p>
                    ) : (
                      <div className='space-y-0.5'>
                        {members.map((m) => {
                          const displayName =
                            m.user?.name ?? m.user?.email ?? 'User';
                          const initials = m.user?.name
                            ? m.user.name
                                .split(' ')
                                .map((s) => s[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()
                            : (m.user?.email?.charAt(0) ?? 'U').toUpperCase();
                          const avatarColor = getAvatarColor(displayName);
                          const handle = m.user?.email
                            ? `@${m.user.email.split('@')[0]}`
                            : '@user';
                          return (
                            <label
                              key={m.userId}
                              className='flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent'
                            >
                              <Checkbox
                                checked={safeFilter.memberIds.includes(
                                  m.userId,
                                )}
                                onCheckedChange={() => toggleMember(m.userId)}
                              />
                              <Avatar className='size-7 shrink-0'>
                                <AvatarImage
                                  src={m.user?.avatar ?? undefined}
                                />
                                <AvatarFallback
                                  className={cn(
                                    'text-[10px] text-white',
                                    avatarColor,
                                  )}
                                >
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className='min-w-0 flex-1'>
                                <span className='block truncate font-medium'>
                                  {m.user?.name ?? m.user?.email ?? m.userId}
                                </span>
                                <span className='block truncate text-xs text-muted-foreground'>
                                  {handle}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Card status */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium text-foreground'>
              Card status
            </Label>
            <div className='flex flex-col gap-2'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <Checkbox
                  checked={safeFilter.cardStatus === 'complete'}
                  onCheckedChange={(c) => setCardStatus(c ? 'complete' : null)}
                />
                <CheckSquare className='size-4 text-muted-foreground' />
                <span className='text-sm'>Marked as complete</span>
              </label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <Checkbox
                  checked={safeFilter.cardStatus === 'incomplete'}
                  onCheckedChange={(c) =>
                    setCardStatus(c ? 'incomplete' : null)
                  }
                />
                <Square className='size-4 text-muted-foreground' />
                <span className='text-sm'>Not marked as complete</span>
              </label>
            </div>
          </div>

          {/* Due date */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium text-foreground'>
              Due date
            </Label>
            <div className='flex flex-col gap-2'>
              {DUE_DATE_OPTIONS.map(({ kind, label, icon }) => (
                <label
                  key={kind}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <Checkbox
                    checked={safeFilter.dueDateFilters.includes(kind)}
                    onCheckedChange={() => toggleDueDate(kind)}
                  />
                  {icon}
                  <span className='text-sm'>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium text-foreground'>
              Labels
            </Label>
            <div className='flex flex-col gap-2'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <Checkbox
                  checked={safeFilter.noLabels}
                  onCheckedChange={(c) => setNoLabels(!!c)}
                />
                <Tag className='size-4 text-muted-foreground' />
                <span className='text-sm'>No labels</span>
              </label>
              <div className='flex items-center gap-2'>
                <label className='flex cursor-pointer items-center gap-2 shrink-0'>
                  <Checkbox
                    checked={allLabelsSelected}
                    onCheckedChange={(c) => selectAllLabels(!!c)}
                  />
                </label>
                <Popover
                  open={selectLabelsOpen}
                  onOpenChange={setSelectLabelsOpen}
                >
                  <PopoverTrigger asChild>
                    <button
                      type='button'
                      className='flex flex-1 min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    >
                      <span>Select labels</span>
                      <ChevronDown className='size-4 shrink-0 text-muted-foreground' />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align='start'
                    className='w-[320px] max-h-[280px] overflow-y-auto p-2 border-accent scrollbar-hidden'
                  >
                    {labels.length === 0 ? (
                      <p className='px-2 py-3 text-xs text-muted-foreground'>
                        No labels
                      </p>
                    ) : (
                      <div className='space-y-0.5'>
                        {labels.map((l) => (
                          <label
                            key={l.id}
                            className='flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent'
                          >
                            <Checkbox
                              checked={safeFilter.labelIds.includes(l.id)}
                              onCheckedChange={() => toggleLabel(l.id)}
                            />
                            <span
                              className='inline-block size-4 rounded shrink-0'
                              style={{
                                backgroundColor: getLabelDisplayColor(l.color),
                              }}
                            />
                            <span className='truncate'>
                              {l.name || 'Unnamed'}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className='pt-2'>
            <Button
              variant='ghost'
              size='sm'
              className='w-full'
              onClick={handleClearAll}
              disabled={!onClearFilters || !active}
            >
              Clear all filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
