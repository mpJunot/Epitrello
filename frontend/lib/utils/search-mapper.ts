/**
 * Search Result Mappers
 * Converts entities to normalized SearchResult format
 */

import type { SearchResult, SearchEntityType, GroupedSearchResults } from '@/lib/types/search';
import { ENTITY_TYPE_ORDER } from '@/lib/utils/search';
import type {
  Card,
  List,
  Board,
  Workspace,
  MemberUser,
} from '@/lib/graphql-types';

/**
 * Map a Card entity to SearchResult
 */
export function mapCardToSearchResult(
  card: Card,
  listId: string,
  listTitle?: string,
  boardId?: string,
  boardTitle?: string
): SearchResult {
  return {
    id: card.id,
    type: 'card',
    title: card.title,
    subtitle: card.description?.substring(0, 100) || listTitle,
    route: boardId ? `/boards/${boardId}` : '/cards',
    queryParams: boardId && listId ? { card: card.id, list: listId } : undefined,
    icon: 'FileText',
    metadata: {
      parent: boardId && boardTitle ? {
        id: boardId,
        title: boardTitle,
        type: 'board',
      } : undefined,
      listId,
      completed: card.completed,
      hasDescription: !!card.description,
      hasAssignees: !!(card.assignees && card.assignees.length > 0),
      hasDueDate: !!card.dueDate,
      assigneeCount: card.assignees?.length || 0,
    },
    priority: card.completed ? 'low' : 'high',
    isArchived: false,
    createdAt: card.createdAt,
  };
}

/**
 * Map a List entity to SearchResult
 */
export function mapListToSearchResult(
  list: List,
  boardId: string,
  boardTitle?: string
): SearchResult {
  const cardCount = list.cards?.length || 0;

  return {
    id: list.id,
    type: 'list',
    title: list.title,
    subtitle: `${cardCount} card${cardCount !== 1 ? 's' : ''}` + (boardTitle ? ` in ${boardTitle}` : ''),
    route: `/boards/${boardId}`,
    queryParams: { list: list.id },
    icon: 'LayoutGrid',
    metadata: {
      parent: boardTitle ? {
        id: boardId,
        title: boardTitle,
        type: 'board',
      } : undefined,
      boardId,
      cardCount,
    },
    priority: 'medium',
    isArchived: list.isArchived,
    createdAt: list.createdAt,
  };
}

/**
 * Map a Board entity to SearchResult
 */
export function mapBoardToSearchResult(
  board: Board | { id: string; title: string; description?: string; background?: string; visibility?: string; workspaceId?: string; members?: { id: string }[] },
  workspaceId?: string,
  workspaceTitle?: string
): SearchResult {
  const listCount = 'lists' in board ? (board.lists?.length || 0) : 0;
  const memberCount = board.members?.length || 0;

  return {
    id: board.id,
    type: 'board',
    title: board.title,
    subtitle: board.description || `${listCount} list${listCount !== 1 ? 's' : ''}, ${memberCount} member${memberCount !== 1 ? 's' : ''}`,
    route: `/boards/${board.id}`,
    icon: 'LayoutGrid',
    avatar: board.background || undefined,
    metadata: {
      parent: workspaceId && workspaceTitle ? {
        id: workspaceId,
        title: workspaceTitle,
        type: 'workspace',
      } : undefined,
      workspaceId,
      visibility: board.visibility,
      listCount,
      memberCount,
      hasDescription: !!board.description,
    },
    priority: 'high',
    isArchived: 'isArchived' in board ? board.isArchived : false,
    createdAt: 'createdAt' in board ? board.createdAt : undefined,
  };
}

/** Partial workspace shape from cache or API */
type WorkspaceLike = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  logoUrl?: string;
  visibility?: string;
  createdAt?: string;
};

/**
 * Map a Workspace entity to SearchResult
 */
export function mapWorkspaceToSearchResult(workspace: Workspace | WorkspaceLike): SearchResult {
  // Support both full Workspace type and partial workspace objects from cache
  const w = workspace as Workspace & WorkspaceLike;
  const workspaceName = w.name || w.title || 'Untitled Workspace';
  const workspaceDescription = w.description || undefined;

  return {
    id: workspace.id,
    type: 'workspace',
    title: workspaceName,
    subtitle: workspaceDescription,
    route: `/workspaces/${workspace.id}/boards`,
    icon: 'Folders',
    avatar: w.logoUrl || undefined,
    metadata: {
      visibility: w.visibility,
      hasDescription: !!workspaceDescription,
    },
    priority: 'high',
    createdAt: w.createdAt,
  };
}

/**
 * Map a Member/User entity to SearchResult
 */
export function mapMemberToSearchResult(
  member: MemberUser,
  context?: {
    boardId?: string;
    workspaceId?: string;
  }
): SearchResult {
  return {
    id: member.id,
    type: 'member',
    title: member.name,
    subtitle: member.email,
    route: context?.workspaceId
      ? `/workspaces/${context.workspaceId}/members`
      : context?.boardId
      ? `/boards/${context.boardId}`
      : '/dashboard',
    icon: 'User',
    avatar: member.avatar || undefined,
    metadata: {
      email: member.email,
    },
    priority: 'medium',
  };
}

/**
 * Convert an array of cards to search results
 */
export function mapCardsToSearchResults(
  cards: Card[],
  boardId: string,
  boardTitle?: string,
  lists?: List[]
): SearchResult[] {
  return cards.map((card) => {
    const list = lists?.find(l => l.id === card.listId);
    return mapCardToSearchResult(card, card.listId, list?.title, boardId, boardTitle);
  });
}

/**
 * Convert an array of lists to search results
 */
export function mapListsToSearchResults(
  lists: List[],
  boardId: string,
  boardTitle?: string
): SearchResult[] {
  return lists.map(list => mapListToSearchResult(list, boardId, boardTitle));
}

/**
 * Convert an array of boards to search results
 */
export function mapBoardsToSearchResults(
  boards: (Board | { id: string; title: string; description?: string; background?: string; visibility?: string; workspaceId?: string; members?: { id: string }[] })[],
  workspaceId?: string,
  workspaceTitle?: string
): SearchResult[] {
  return boards.map(board => mapBoardToSearchResult(board, workspaceId, workspaceTitle));
}

/**
 * Convert an array of workspaces to search results
 */
export function mapWorkspacesToSearchResults(workspaces: Workspace[]): SearchResult[] {
  return workspaces.map(ws => mapWorkspaceToSearchResult(ws));
}

/**
 * Convert an array of members to search results
 */
export function mapMembersToSearchResults(
  members: MemberUser[],
  context?: {
    boardId?: string;
    workspaceId?: string;
  }
): SearchResult[] {
  return members.map(member => mapMemberToSearchResult(member, context));
}

/**
 * Predefined order for entity types in grouped results
 * Ensures stable, predictable ordering across the application
 * Hierarchy: board > list > card > workspace > member
 */
function getEntityTypeOrder(type: SearchEntityType): number {
  return ENTITY_TYPE_ORDER[type];
}

/**
 * Group search results by type with stable ordering
 * Maintains order: board > list > card > workspace > member
 * Within each type, preserves ranking order from search relevance
 */
export function groupSearchResults(results: SearchResult[]): GroupedSearchResults {
  // Sort by type order, then maintain score order within each type
  const sorted = [...results].sort((a, b) => {
    const orderA = getEntityTypeOrder(a.type);
    const orderB = getEntityTypeOrder(b.type);

    // Different types: sort by predefined hierarchy
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Same type: maintain original order (preserves relevance ranking)
    return 0;
  });

  return {
    boards: sorted.filter(r => r.type === 'board'),
    lists: sorted.filter(r => r.type === 'list'),
    cards: sorted.filter(r => r.type === 'card'),
    workspaces: sorted.filter(r => r.type === 'workspace'),
    members: sorted.filter(r => r.type === 'member'),
  };
}

/**
 * Flatten grouped results back to single array maintaining order
 * Order: boards > lists > cards > workspaces > members
 */
export function flattenGroupedResults(grouped: GroupedSearchResults): SearchResult[] {
  return [
    ...grouped.boards,
    ...grouped.lists,
    ...grouped.cards,
    ...grouped.workspaces,
    ...grouped.members,
  ];
}
