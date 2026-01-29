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
 * Creates a content signature for comparing card arrays
 */
export const createCardsSignature = (
  cards: Array<{ id: string; title: string; description?: string | null; completed?: boolean | null }>
): string => {
  return cards.map((c) => `${c.id}:${c.title}:${c.description || ''}:${c.completed ?? false}`).join('|');
};
