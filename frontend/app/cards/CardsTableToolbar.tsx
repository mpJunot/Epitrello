'use client';

import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { LabelBadge } from '@/components/LabelBadge';
import { Checkbox } from '@/components/ui/checkbox';
import type { SortOption, DueDateFilter, AssigneeFilter } from './types';

type BoardItem = { id: string; title: string };
type ListItem = { id: string; title: string };
type LabelItem = { id: string; name?: string | null; color?: string | null };

export type CardsTableToolbarProps = {
  sortBy: SortOption;
  setSortBy: (v: SortOption) => void;
  filterBoardId: string | null;
  setFilterBoardId: (v: string | null) => void;
  filterListId: string | null;
  setFilterListId: (v: string | null) => void;
  filterLabelIds: Set<string>;
  toggleLabelFilter: (id: string) => void;
  filterDueDate: DueDateFilter;
  setFilterDueDate: (v: DueDateFilter) => void;
  filterAssignee: AssigneeFilter;
  setFilterAssignee: (v: AssigneeFilter) => void;
  filterOpen: boolean;
  setFilterOpen: (v: boolean) => void;
  clearFilters: () => void;
  hasFilters: boolean;
  boards: BoardItem[];
  lists: ListItem[];
  allLabels: LabelItem[];
  currentUserId?: string | null;
};

export function CardsTableToolbar({
  sortBy,
  setSortBy,
  filterBoardId,
  setFilterBoardId,
  filterListId,
  setFilterListId,
  filterLabelIds,
  toggleLabelFilter,
  filterDueDate,
  setFilterDueDate,
  filterAssignee,
  setFilterAssignee,
  filterOpen,
  setFilterOpen,
  clearFilters,
  hasFilters,
  boards,
  lists,
  allLabels,
  currentUserId,
}: CardsTableToolbarProps) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Sort by' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='board'>Sort by board</SelectItem>
          <SelectItem value='list'>Sort by list</SelectItem>
          <SelectItem value='dueDate'>Sort by due date</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm' className='border-border'>
            <Filter className='h-4 w-4 mr-1' />
            Filter cards
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80 border-accent max-h-[80vh] overflow-y-auto' align='start'>
          <div className='space-y-4'>
            <div>
              <Label className='mb-2 block'>Board</Label>
              <Select
                value={filterBoardId ?? 'all'}
                onValueChange={(v) => setFilterBoardId(v === 'all' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All boards' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All boards</SelectItem>
                  {boards.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className='mb-2 block'>List</Label>
              <Select
                value={filterListId ?? 'all'}
                onValueChange={(v) => setFilterListId(v === 'all' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All lists' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All lists</SelectItem>
                  {lists.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {allLabels.length > 0 && (
              <div>
                <Label className='mb-2 block'>Labels</Label>
                <div className='flex flex-wrap gap-2'>
                  {allLabels.map((label) => (
                    <label
                      key={label.id}
                      className='flex items-center gap-2 cursor-pointer text-sm'
                    >
                      <Checkbox
                        checked={filterLabelIds.has(label.id)}
                        onCheckedChange={() => toggleLabelFilter(label.id)}
                      />
                      <LabelBadge label={label} variant='chip' readOnly />
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label className='mb-2 block'>Due date</Label>
              <Select
                value={filterDueDate}
                onValueChange={(v) => setFilterDueDate(v as DueDateFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='overdue'>Overdue</SelectItem>
                  <SelectItem value='dueThisWeek'>Due this week</SelectItem>
                  <SelectItem value='dueThisMonth'>Due this month</SelectItem>
                  <SelectItem value='noDate'>No date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {currentUserId && (
              <div>
                <Label className='mb-2 block'>Assignee</Label>
                <Select
                  value={filterAssignee}
                  onValueChange={(v) => setFilterAssignee(v as AssigneeFilter)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='assignedToMe'>Assigned to me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <Button variant='ghost' size='sm' onClick={clearFilters} className='text-muted-foreground'>
          <X className='h-4 w-4 mr-1' />
          Clear filters
        </Button>
      )}
    </div>
  );
}
