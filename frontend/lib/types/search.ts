/**
 * Search Result Types
 * Normalized structure for all searchable entities
 */

/**
 * Type of entity in search results
 */
export type SearchEntityType = 'card' | 'list' | 'board' | 'workspace' | 'member';

/**
 * Priority level for search result ranking
 */
export type SearchPriority = 'high' | 'medium' | 'low';

/**
 * Normalized search result format
 * All entities are mapped to this common structure
 */
export interface SearchResult {
  /** Unique identifier for the entity */
  id: string;

  /** Type of entity (card, list, board, workspace, member) */
  type: SearchEntityType;

  /** Main title/name of the entity */
  title: string;

  /** Secondary information (description, context, etc.) */
  subtitle?: string;

  /** Navigation route for this entity */
  route: string;

  /** Query parameters for deep linking */
  queryParams?: Record<string, string>;

  /** Icon name from lucide-react (optional) */
  icon?: string;

  /** Avatar/image URL (for users, boards with background) */
  avatar?: string;

  /** Color indicator (for labels, workspace branding) */
  color?: string;

  /** Additional metadata for context */
  metadata?: {
    /** Parent entity information for breadcrumb */
    parent?: {
      id: string;
      title: string;
      type: SearchEntityType;
    };

    /** Entity-specific additional data */
    [key: string]: unknown;
  };

  /** Priority for ranking search results */
  priority?: SearchPriority;

  /** Whether entity is archived */
  isArchived?: boolean;

  /** Creation date for recency ranking */
  createdAt?: string;
}

/**
 * Search results grouped by type
 */
export interface GroupedSearchResults {
  cards: SearchResult[];
  lists: SearchResult[];
  boards: SearchResult[];
  workspaces: SearchResult[];
  members: SearchResult[];
}

/**
 * Search result with relevance score
 */
export interface RankedSearchResult extends SearchResult {
  /** Relevance score (0-1) for ranking results */
  score: number;
}
