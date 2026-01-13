"use client";

import React, { useState, useEffect, useRef } from "react";
import CardItem from "./CardItem";

type Label = { id: string; name?: string; color?: string };
type UserRef = { id: string; name?: string; avatar?: string; email?: string };
type Card = {
  id: string;
  title: string;
  description?: string;
  labels?: Label[];
  assignees?: UserRef[];
};

export default function ListColumn({ list }: { list: { id: string; title: string; cards?: Card[] } }) {
  const [cards, setCards] = useState<Card[]>(list.cards || []);
  const [lastLocalChange, setLastLocalChange] = useState<number>(0);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title || "Untitled");
  const [ignoreParentSync, setIgnoreParentSync] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // keep local cards in sync if parent updates the list prop (but not during drag or immediately after a local reorder)
  useEffect(() => {
    if (ignoreParentSync) return;

    const incoming = list.cards || [];
    const localIds = cards.map((c) => c.id).join('|');
    const incomingIds = incoming.map((c) => c.id).join('|');

    // If the order and content are identical, skip
    if (localIds === incomingIds) return;

    // If we just performed a local change (<400ms), skip one cycle to avoid overwriting local reorder
    if (Date.now() - lastLocalChange < 400) return;

    setCards(incoming);
  }, [list.cards, ignoreParentSync, cards, lastLocalChange]);

  // keep title in sync if parent updates
  useEffect(() => {
    setTitle(list.title || "Untitled");
  }, [list.title]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Handle external card moves (from other lists)
  useEffect(() => {
    const handleCardMove = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { cardId, fromListId, toListId, toIndex } = customEvent.detail;
      
      if (toListId === list.id && fromListId !== list.id) {
        // A card is being moved TO this list FROM another list
        // We need to find the card in the global state and add it
        // This is a placeholder - actual implementation depends on parent component
      }
      
      if (fromListId === list.id && toListId !== list.id) {
        // A card is being moved FROM this list TO another list
        const newCards = cards.filter(c => c.id !== cardId);
        setCards(newCards);
      }
    };

    window.addEventListener('epitrello:card-move', handleCardMove);
    return () => window.removeEventListener('epitrello:card-move', handleCardMove);
  }, [list.id, cards]);

  // Drag & drop state
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const addCard = () => {
    // legacy placeholder (no-op) kept for compatibility; real add uses composer
    return;
  };

  // Card composer state
  const [addingCard, setAddingCard] = useState(false);
  const [cardText, setCardText] = useState("");
  const [cardError, setCardError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (addingCard && textareaRef.current) textareaRef.current.focus();
  }, [addingCard]);

  const submitCard = () => {
    const title = (cardText || "").trim();
    if (!title) {
      // Validation échouée : afficher erreur avec shake
      setCardError(true);
      setTimeout(() => setCardError(false), 500);
      return;
    }
    const id = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : Date.now().toString();
    const c: Card = { id, title, description: "" };
    const next = [...cards, c];
    setCards(next);
    try { window.dispatchEvent(new CustomEvent("epitrello:card-created", { detail: { listId: list.id, card: c } })); } catch (e) {}
    // clear textarea and keep focus for multiple cards
    setCardText("");
    setCardError(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const cancelAdd = () => {
    setAddingCard(false);
    setCardText("");
    // return focus to the add button after close
    setTimeout(() => addButtonRef.current?.focus(), 0);
  };

  const saveTitle = () => {
    const nextTitle = (title || "").trim();
    if (!nextTitle) {
      // do not accept empty titles: revert to previous and close
      setTitle(list.title || "Untitled");
      setEditing(false);
      return;
    }

    setTitle(nextTitle);
    setEditing(false);
    // notify others that the list title changed (only if different)
    if (nextTitle !== (list.title || "")) {
      window.dispatchEvent(new CustomEvent("epitrello:list-updated", { detail: { listId: list.id, title: nextTitle } }));
    }
  };

  // drag handlers
  const handleCardDragStart = (e: React.DragEvent, cardId: string, fromIndex?: number) => {
    setIgnoreParentSync(true);
    try {
      e.dataTransfer.setData('application/json', JSON.stringify({ cardId, fromListId: list.id, fromIndex }));
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {}
    // visual
    const el = e.currentTarget as HTMLElement;
    el.classList.add('opacity-70', 'scale-105');
  };

  const handleCardDragOver = (e: React.DragEvent, overIndex?: number) => {
    e.preventDefault();
    setIsDragOver(true);
    setDragOverIndex(typeof overIndex === 'number' ? overIndex : null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const raw = e.dataTransfer.getData('application/json');

    try {
      const data = raw ? JSON.parse(raw) : null;
      if (data && data.cardId) {
        const provisionalIndex = dragOverIndex !== null ? dragOverIndex : cards.length;
        const isIntralistMove = data.fromListId === list.id;

        // If moving within the same list, update local state directly and adjust indices safely
        if (isIntralistMove) {
          console.log('Moving card within same list');
          const fromIndex = typeof data.fromIndex === 'number' ? data.fromIndex : cards.findIndex((c) => c.id === data.cardId);
          console.log('fromIndex:', fromIndex, 'toIndex:', provisionalIndex);
          if (fromIndex !== -1) {
            let toIndex = provisionalIndex;
            if (toIndex === fromIndex) {
              console.log('No move needed, same index');
              setIgnoreParentSync(false);
              setDragOverIndex(null);
              return; // no move needed
            }
            // When removing an earlier item, the target index shifts by -1
            console.log('Adjusted toIndex before move:', toIndex);
            if (fromIndex < toIndex) {
              toIndex = Math.max(0, toIndex - 1);
            }
            console.log('Final toIndex after adjustment:', toIndex);
            const newCards = [...cards];
            const [card] = newCards.splice(fromIndex, 1);
            newCards.splice(toIndex, 0, card);
            console.log('New card order:', newCards.map(c => c.id));
            setCards(newCards);
            setLastLocalChange(Date.now());
            // For intra-list moves, we're done - no need to dispatch event or wait for parent sync
            setIgnoreParentSync(false);
          }
        } else {
          // For inter-list moves, dispatch event and let parent handle it
          window.dispatchEvent(
            new CustomEvent('epitrello:card-move', {
              detail: { cardId: data.cardId, fromListId: data.fromListId, toListId: list.id, toIndex: provisionalIndex },
            })
          );
          setIgnoreParentSync(false);
        }
      }
    } catch (err) {
      // swallow
    } finally {
      setDragOverIndex(null);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set isDragOver to false if leaving the entire column area
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
      setDragOverIndex(null);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={handleDragLeave}
      className={`w-[272px] min-w-[272px] flex-shrink-0 ${isDragOver ? 'bg-white ring-2 ring-indigo-200' : 'bg-gray-100'} rounded-md shadow-sm flex flex-col animate-slide-in`}
      style={{ height: '100%', maxHeight: '100%' }}
    >
      {/* Header fixe de la colonne */}
      <div className="p-4 pb-3 flex-shrink-0">
        {!editing ? (
          <h3
            className="font-medium text-gray-800 text-sm cursor-text"
            onClick={() => setEditing(true)}
            title="Click to edit"
          >
            {title}
          </h3>
        ) : (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              } else if (e.key === "Escape") {
                setEditing(false);
                setTitle(list.title || "Untitled");
              }
            }}
            className="w-full bg-white text-gray-900 text-sm rounded px-2 py-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
          />
        )}
      </div>

      {/* Zone des cartes avec scroll vertical */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-3 custom-scrollbar" style={{ minHeight: 0 }}>
        {cards.map((c, i) => (
          <div key={`${c.id}-${i}`} className="relative animate-fade-in">
            {/* optional insert marker when dragging over this index */}
            {dragOverIndex === i && (
              <div className="absolute -top-2 left-0 right-0 h-1 bg-indigo-200 rounded" />
            )}
            <CardItem
              card={c}
              listId={list.id}
              index={i}
              onDragStart={handleCardDragStart}
              onDragOver={handleCardDragOver}
            />
          </div>
        ))}
        {/* marker at end */}
        {dragOverIndex === cards.length && <div className="h-1 bg-indigo-200 rounded" />}
      </div>

      {/* Footer fixe pour ajouter des cartes */}
      <div className="p-4 pt-3 border-t border-gray-200 flex-shrink-0 bg-gray-100">
        {!addingCard ? (
          <button
            ref={addButtonRef}
            onClick={() => setAddingCard(true)}
            className="w-full text-left text-sm text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 rounded px-3 py-2 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            + Add a card
          </button>
        ) : (
          <div className={cardError ? 'animate-shake' : ''}>
            <textarea
              ref={textareaRef}
              placeholder="Enter a title for this card"
              value={cardText}
              onChange={(e) => {
                setCardText(e.target.value);
                if (cardError) setCardError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitCard();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelAdd();
                }
              }}
              className={`w-full min-h-[64px] p-2 rounded border ${
                cardError ? 'border-red-400 bg-red-50' : 'border-gray-200'
              } text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors`}
            />
            {cardError && (
              <p className="text-xs text-red-600 mt-1">Le titre de la carte est requis</p>
            )}

            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => submitCard()}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 active:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
              >
                Add card
              </button>
              <button
                onClick={cancelAdd}
                className="px-2 py-1 text-sm text-gray-600 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label="Cancel add card"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
