/**
 * Search Utilities
 * Helper functions for search operations
 */

import type { SearchEntityType } from '@/lib/types/search';

/**
 * Entity type display order for grouping and sorting
 * Ensures stable, predictable ordering in results
 * Order: board > list > card > workspace > member
 */
export const ENTITY_TYPE_ORDER: Record<SearchEntityType, number> = {
  board: 0,      // Boards first (highest organizational level)
  list: 1,       // Lists second (within boards)
  card: 2,       // Cards third (within lists)
  workspace: 3,  // Workspaces fourth (organizational container)
  member: 4,     // Members last (people/users)
};
