/**
 * Dispatches a custom event with error handling
 */
export const dispatchCustomEvent = (eventName: string, detail: Record<string, unknown> | undefined) => {
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  } catch (error) {
    console.error(`Error dispatching ${eventName}:`, error);
  }
};

/**
 * Generates a unique ID for new entities
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
};

/**
 * Creates a content signature for comparing card arrays.
 * Includes title, description, completed, labels, assignees, dueDate, startDate, background, checklists
 */
export const createCardsSignature = (
  cards: Array<{
    id: string;
    title?: string;
    description?: string | null;
    completed?: boolean | null;
    dueDate?: string | null;
    startDate?: string | null;
    background?: string | null;
    labels?: Array<{ id: string }> | null;
    assignees?: Array<{ id: string }> | null;
    checklists?: Array<{ id: string; items?: unknown[] }> | null;
  }>
): string => {
  return cards
    .map((c) => {
      const labelIds = (c.labels ?? []).map((l) => l.id).sort().join(',');
      const assigneeIds = (c.assignees ?? []).map((a) => a.id).sort().join(',');
      const checklistSig = (c.checklists ?? []).map((cl) => `${cl.id}:${(cl.items ?? []).length}`).join(';');
      return `${c.id}:${c.title ?? ''}:${c.description ?? ''}:${c.completed ?? false}:${c.dueDate ?? ''}:${c.startDate ?? ''}:${c.background ?? ''}:${labelIds}:${assigneeIds}:${checklistSig}`;
    })
    .join('|');
};
