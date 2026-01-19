/**
 * Dispatches a custom event with error handling
 */
export const dispatchCustomEvent = (eventName: string, detail: any) => {
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
  return (crypto as any)?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
};

/**
 * Creates a content signature for comparing card arrays
 */
export const createCardsSignature = (cards: Array<{ id: string; title: string; description?: string }>): string => {
  return cards.map((c) => `${c.id}:${c.title}:${c.description || ''}`).join('|');
};
