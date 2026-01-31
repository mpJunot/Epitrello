'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { LabelBadge } from '@/components/LabelBadge';
import type { CardRow, SortOption, DueDateFilter, AssigneeFilter } from './types';
import { formatDueDate, isOverdue, cardMatchesDueDateFilter } from './cardsTableUtils';
import { CardsTableToolbar } from './CardsTableToolbar';

export type { CardRow } from './types';

export function CardsTable({
  cards,
  currentUserId = null,
}: {
  cards: CardRow[];
  currentUserId?: string | null;
}) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('board');
  const [filterBoardId, setFilterBoardId] = useState<string | null>(null);
  const [filterListId, setFilterListId] = useState<string | null>(null);
  const [filterLabelIds, setFilterLabelIds] = useState<Set<string>>(new Set());
  const [filterDueDate, setFilterDueDate] = useState<DueDateFilter>('all');
  const [filterAssignee, setFilterAssignee] = useState<AssigneeFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const boards = useMemo(() => {
    const seen = new Map<string, { id: string; title: string }>();
    for (const c of cards) {
      if (!seen.has(c.boardId)) seen.set(c.boardId, { id: c.boardId, title: c.boardTitle });
    }
    return Array.from(seen.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [cards]);

  const lists = useMemo(() => {
    const seen = new Map<string, { id: string; title: string }>();
    for (const c of cards) {
      if (!seen.has(c.listId)) seen.set(c.listId, { id: c.listId, title: c.listTitle });
    }
    return Array.from(seen.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [cards]);

  const allLabels = useMemo(() => {
    const seen = new Map<string, { id: string; name?: string | null; color?: string | null }>();
    for (const c of cards) {
      for (const label of c.labels ?? []) {
        if (!seen.has(label.id)) seen.set(label.id, label);
      }
    }
    return Array.from(seen.values()).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }, [cards]);

  const filteredAndSorted = useMemo(() => {
    let list = [...cards];
    if (filterBoardId) list = list.filter((c) => c.boardId === filterBoardId);
    if (filterListId) list = list.filter((c) => c.listId === filterListId);
    if (filterLabelIds.size > 0) {
      list = list.filter((c) =>
        (c.labels ?? []).some((l) => filterLabelIds.has(l.id)),
      );
    }
    list = list.filter((c) => cardMatchesDueDateFilter(c, filterDueDate));
    if (filterAssignee === 'assignedToMe' && currentUserId) {
      list = list.filter((c) => (c.assigneeIds ?? []).includes(currentUserId));
    }
    if (sortBy === 'board') {
      list.sort((a, b) => a.boardTitle.localeCompare(b.boardTitle) || a.listTitle.localeCompare(b.listTitle) || a.title.localeCompare(b.title));
    } else if (sortBy === 'list') {
      list.sort((a, b) => a.listTitle.localeCompare(b.listTitle) || a.boardTitle.localeCompare(b.boardTitle) || a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        if (da !== db) return da - db;
        return a.title.localeCompare(b.title);
      });
    }
    return list;
  }, [cards, filterBoardId, filterListId, filterLabelIds, filterDueDate, filterAssignee, currentUserId, sortBy]);

  const hasFilters =
    filterBoardId !== null ||
    filterListId !== null ||
    filterLabelIds.size > 0 ||
    filterDueDate !== 'all' ||
    filterAssignee !== 'all';

  const clearFilters = () => {
    setFilterBoardId(null);
    setFilterListId(null);
    setFilterLabelIds(new Set());
    setFilterDueDate('all');
    setFilterAssignee('all');
    setFilterOpen(false);
  };

  const toggleLabelFilter = (labelId: string) => {
    setFilterLabelIds((prev) => {
      const next = new Set(prev);
      if (next.has(labelId)) next.delete(labelId);
      else next.add(labelId);
      return next;
    });
  };

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <CardsTableToolbar
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterBoardId={filterBoardId}
        setFilterBoardId={setFilterBoardId}
        filterListId={filterListId}
        setFilterListId={setFilterListId}
        filterLabelIds={filterLabelIds}
        toggleLabelFilter={toggleLabelFilter}
        filterDueDate={filterDueDate}
        setFilterDueDate={setFilterDueDate}
        filterAssignee={filterAssignee}
        setFilterAssignee={setFilterAssignee}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        clearFilters={clearFilters}
        hasFilters={hasFilters}
        boards={boards}
        lists={lists}
        allLabels={allLabels}
        currentUserId={currentUserId}
      />

      <div className='rounded-lg border border-accent overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-accent bg-muted/50'>
                <th className='text-left font-medium px-4 py-3'>Card</th>
                <th className='text-left font-medium px-4 py-3'>List</th>
                <th className='text-left font-medium px-4 py-3'>Labels</th>
                <th className='text-left font-medium px-4 py-3'>Due date</th>
                <th className='text-left font-medium px-4 py-3'>Board</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((card) => {
                const overdue = isOverdue(card.dueDate, card.completed);
                const cardUrl = `/boards/${card.boardId}?card=${card.id}`;
                const boardUrl = `/boards/${card.boardId}`;
                return (
                  <tr
                    key={card.id}
                    role='button'
                    tabIndex={0}
                    className='border-b border-accent/50 hover:bg-accent/30 transition-colors cursor-pointer'
                    onClick={() => router.push(cardUrl)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(cardUrl);
                      }
                    }}
                  >
                    <td className='px-4 py-3'>
                      <Link
                        href={cardUrl}
                        className='font-medium text-foreground hover:underline cursor-pointer'
                        onClick={(e) => e.stopPropagation()}
                      >
                        {card.title}
                      </Link>
                    </td>
                    <td className='px-4 py-3 text-muted-foreground'>
                      <Link
                        href={boardUrl}
                        className='flex items-center gap-1.5 hover:text-foreground hover:underline cursor-pointer'
                        onClick={(e) => e.stopPropagation()}
                      >
                        {overdue && (
                          <AlertCircle className='h-4 w-4 text-destructive shrink-0' aria-hidden />
                        )}
                        {card.completed && (
                          <CheckCircle2 className='h-4 w-4 text-green-600 shrink-0' aria-hidden />
                        )}
                        {card.listTitle}
                      </Link>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex flex-wrap gap-1'>
                        {(card.labels ?? []).map((label) => (
                          <button
                            key={label.id}
                            type='button'
                            className='rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background cursor-pointer hover:opacity-80'
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLabelFilter(label.id);
                            }}
                            title={`Filter by ${label.name ?? 'label'}`}
                          >
                            <LabelBadge
                              label={label}
                              variant='dot'
                              readOnly
                              title={label.name ?? undefined}
                            />
                          </button>
                        ))}
                        {(!card.labels || card.labels.length === 0) && (
                          <span className='text-muted-foreground'>—</span>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <Link
                        href={cardUrl}
                        className={`flex items-center gap-1.5 hover:underline cursor-pointer ${overdue ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {overdue && <AlertCircle className='h-4 w-4 shrink-0' aria-hidden />}
                        {formatDueDate(card.dueDate ?? undefined)}
                      </Link>
                    </td>
                    <td className='px-4 py-3'>
                      <Link
                        href={boardUrl}
                        className='flex items-center gap-2 text-muted-foreground hover:text-foreground hover:underline cursor-pointer'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className='h-8 w-12 shrink-0 rounded overflow-hidden border border-accent'
                          style={
                            card.boardBackground?.startsWith('http') ||
                            card.boardBackground?.startsWith('/')
                              ? {
                                  backgroundImage: `url(${card.boardBackground})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }
                              : {
                                  backgroundColor:
                                    card.boardBackground || 'var(--muted)',
                                }
                          }
                          aria-hidden
                        />
                        <span>{card.boardTitle}</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
