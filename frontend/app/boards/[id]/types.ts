import type {
  Board as GqlBoard,
  BoardMemberWithUser,
  List as GqlList,
  Card as GqlCard,
  Visibility,
  MemberUser,
  Label as GqlLabel,
} from '@/lib/graphql-types';

export type Card = Pick<
  GqlCard,
  'id' | 'title' | 'description' | 'position' | 'listId' | 'dueDate' | 'startDate' | 'completed' | 'background' | 'createdAt'
> & {
  assignees?: Array<MemberUser>;
  labels?: Array<GqlLabel>;
  checklists?: Array<{
    id: string;
    title: string;
    items?: Array<{
      id: string;
      checked: boolean;
      content: string;
      position: number;
      checklistId: string;
    }>;
  }>;
};

export type List = Pick<GqlList, 'id' | 'title' | 'position' | 'isArchived'> & {
  cards?: Card[];
};

export type BoardMember = BoardMemberWithUser;

export type Board = Omit<GqlBoard, 'lists'> & {
  visibility: Visibility;
  members?: BoardMember[];
  lists?: List[];
};

/** Due date filter options (multiple can be active). */
export type DueDateFilterKind =
  | 'noDate'
  | 'overdue'
  | 'dueNextDay'
  | 'dueNextWeek'
  | 'dueNextMonth';

export type CardStatusFilter = 'complete' | 'incomplete' | null;

export interface BoardFilterState {
  keyword: string;
  noMembers: boolean;
  assignedToMe: boolean;
  memberIds: string[];
  labelIds: string[];
  noLabels: boolean;
  cardStatus: CardStatusFilter;
  dueDateFilters: DueDateFilterKind[];
}

export const DEFAULT_BOARD_FILTER: BoardFilterState = {
  keyword: '',
  noMembers: false,
  assignedToMe: false,
  memberIds: [],
  labelIds: [],
  noLabels: false,
  cardStatus: null,
  dueDateFilters: [],
};

const FILTER_STORAGE_KEY_PREFIX = 'epitrello:board:';
const FILTER_STORAGE_KEY_SUFFIX = ':filter';

export function getBoardFilterStorageKey(boardId: string): string {
  return `${FILTER_STORAGE_KEY_PREFIX}${boardId}${FILTER_STORAGE_KEY_SUFFIX}`;
}

const DUE_DATE_KINDS: DueDateFilterKind[] = [
  'noDate',
  'overdue',
  'dueNextDay',
  'dueNextWeek',
  'dueNextMonth',
];

/** Parse and validate a stored filter from localStorage. Returns null if invalid. */
export function parseStoredBoardFilter(
  raw: string | null,
): BoardFilterState | null {
  if (raw == null || raw === '') return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (data == null || typeof data !== 'object') return null;
    const o = data as Record<string, unknown>;
    const keyword = typeof o.keyword === 'string' ? o.keyword : '';
    const noMembers = o.noMembers === true;
    const assignedToMe = o.assignedToMe === true;
    const memberIds = Array.isArray(o.memberIds)
      ? (o.memberIds as unknown[]).filter((id): id is string => typeof id === 'string')
      : [];
    const labelIds = Array.isArray(o.labelIds)
      ? (o.labelIds as unknown[]).filter((id): id is string => typeof id === 'string')
      : [];
    const noLabels = o.noLabels === true;
    const cardStatus =
      o.cardStatus === 'complete' || o.cardStatus === 'incomplete'
        ? o.cardStatus
        : null;
    const dueDateFilters = Array.isArray(o.dueDateFilters)
      ? (o.dueDateFilters as unknown[]).filter((k): k is DueDateFilterKind =>
          DUE_DATE_KINDS.includes(k as DueDateFilterKind),
        )
      : [];
    return {
      keyword,
      noMembers,
      assignedToMe,
      memberIds,
      labelIds,
      noLabels,
      cardStatus,
      dueDateFilters,
    };
  } catch {
    return null;
  }
}

/** Returns true if the card matches the current filter state. currentUserId is used for "Cards assigned to me". */
export function cardMatchesFilter(
  card: Card,
  filter: BoardFilterState,
  currentUserId?: string | null,
): boolean {
  const kw = filter.keyword.trim().toLowerCase();
  if (kw) {
    const title = (card.title ?? '').toLowerCase();
    const desc = (card.description ?? '').toLowerCase();
    if (!title.includes(kw) && !desc.includes(kw)) return false;
  }
  const hasMemberFilter =
    filter.noMembers ||
    filter.assignedToMe ||
    filter.memberIds.length > 0;
  if (hasMemberFilter) {
    const assigneeIds = (card.assignees ?? []).map((a) => a.id);
    const noAssignees = assigneeIds.length === 0;
    const matches =
      (filter.noMembers && noAssignees) ||
      (filter.assignedToMe &&
        !!currentUserId &&
        assigneeIds.includes(currentUserId)) ||
      (filter.memberIds.length > 0 &&
        filter.memberIds.some((id) => assigneeIds.includes(id)));
    if (!matches) return false;
  }
  const hasLabelFilter = filter.noLabels || filter.labelIds.length > 0;
  if (hasLabelFilter) {
    const cardLabelIds = (card.labels ?? []).map((l) => l.id);
    const noLabels = cardLabelIds.length === 0;
    const matches =
      (filter.noLabels && noLabels) ||
      (filter.labelIds.length > 0 &&
        filter.labelIds.some((id) => cardLabelIds.includes(id)));
    if (!matches) return false;
  }
  if (filter.cardStatus) {
    const completed = !!card.completed;
    if (
      (filter.cardStatus === 'complete' && !completed) ||
      (filter.cardStatus === 'incomplete' && completed)
    )
      return false;
  }
  if (filter.dueDateFilters.length > 0) {
    const due = card.dueDate ? new Date(card.dueDate) : null;
    const now = new Date();
    const inOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const inOneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const matchesAny = filter.dueDateFilters.some((kind) => {
      switch (kind) {
        case 'noDate':
          return !due;
        case 'overdue':
          return !!due && due < now;
        case 'dueNextDay':
          return !!due && due >= now && due <= inOneDay;
        case 'dueNextWeek':
          return !!due && due >= now && due <= inOneWeek;
        case 'dueNextMonth':
          return !!due && due >= now && due <= inOneMonth;
        default:
          return false;
      }
    });
    if (!matchesAny) return false;
  }
  return true;
}

/** Returns a new board with lists containing only cards that match the filter. */
export function applyBoardFilter(
  board: Board,
  filter: BoardFilterState,
  currentUserId?: string | null,
): Board {
  if (!hasActiveFilter(filter)) return board;
  const filteredLists: List[] = (board.lists ?? []).map((list) => ({
    ...list,
    cards: (list.cards ?? []).filter((card) =>
      cardMatchesFilter(card, filter, currentUserId),
    ),
  }));
  return { ...board, lists: filteredLists };
}

export function hasActiveFilter(filter: BoardFilterState): boolean {
  return (
    filter.keyword.trim() !== '' ||
    filter.noMembers ||
    filter.assignedToMe ||
    filter.memberIds.length > 0 ||
    filter.noLabels ||
    filter.labelIds.length > 0 ||
    filter.cardStatus != null ||
    filter.dueDateFilters.length > 0
  );
}


export function countActiveFilters(filter: BoardFilterState): number {
  let n = 0;
  if (filter.keyword.trim() !== '') n += 1;
  if (filter.noMembers) n += 1;
  if (filter.assignedToMe) n += 1;
  n += filter.memberIds.length;
  if (filter.noLabels) n += 1;
  n += filter.labelIds.length;
  if (filter.cardStatus != null) n += 1;
  n += filter.dueDateFilters.length;
  return n;
}
