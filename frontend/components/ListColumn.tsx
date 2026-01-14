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

export default function ListColumn({ 
  list, 
  totalListsCount = 1 
}: { 
  list: { id: string; title: string; cards?: Card[] }; 
  totalListsCount?: number;
}) {
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

  // Column actions menu state
  const [showActions, setShowActions] = useState(false);
  const [isHoveringColumn, setIsHoveringColumn] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const actionsButtonRef = useRef<HTMLButtonElement | null>(null);

  // Copy list submenu state
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [copyListName, setCopyListName] = useState("");
  const copyNameInputRef = useRef<HTMLInputElement | null>(null);

  // Move list submenu state
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [movePosition, setMovePosition] = useState("0");

  // Move all cards submenu state
  const [showMoveAllCardsMenu, setShowMoveAllCardsMenu] = useState(false);
  const [targetListId, setTargetListId] = useState("");

  // Sort submenu state
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeSortOption, setActiveSortOption] = useState<string | null>(null);

  useEffect(() => {
    if (addingCard && textareaRef.current) textareaRef.current.focus();
  }, [addingCard]);

  // Focus on copy list name input when submenu opens
  useEffect(() => {
    if (showCopyMenu && copyNameInputRef.current) {
      copyNameInputRef.current.focus();
      copyNameInputRef.current.select();
    }
  }, [showCopyMenu]);

  // Gérer la fermeture du menu d'actions
  useEffect(() => {
    if (!showActions) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Fermer si on clique en dehors du menu et du bouton
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(target) &&
        actionsButtonRef.current &&
        !actionsButtonRef.current.contains(target)
      ) {
        setShowActions(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showActions]);

  // Gérer la fermeture du sous-menu de copie
  useEffect(() => {
    if (!showCopyMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(target)) {
        setShowCopyMenu(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCopyMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showCopyMenu]);

  // Gérer la fermeture du sous-menu de déplacement
  useEffect(() => {
    if (!showMoveMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(target)) {
        setShowMoveMenu(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMoveMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMoveMenu]);

  // Gérer la fermeture du sous-menu de déplacement de toutes les cartes
  useEffect(() => {
    if (!showMoveAllCardsMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(target)) {
        setShowMoveAllCardsMenu(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMoveAllCardsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMoveAllCardsMenu]);

  // Gérer la fermeture du sous-menu de tri
  useEffect(() => {
    if (!showSortMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(target)) {
        setShowSortMenu(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showSortMenu]);

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

  const openCopyMenu = () => {
    setShowActions(false);
    setCopyListName(`${title} (copy)`);
    setShowCopyMenu(true);
  };

  const openMoveMenu = () => {
    // Vérifier s'il y a d'autres listes disponibles
    if (totalListsCount <= 1) {
      // Ne pas ouvrir le menu s'il n'y a qu'une seule liste
      setShowActions(false);
      return;
    }
    setShowActions(false);
    setMovePosition("0");
    setShowMoveMenu(true);
  };

  const openMoveAllCardsMenu = () => {
    // Vérifier s'il y a d'autres listes disponibles
    if (totalListsCount <= 1) {
      // Ne pas ouvrir le menu s'il n'y a qu'une seule liste
      setShowActions(false);
      return;
    }
    setShowActions(false);
    setTargetListId("");
    setShowMoveAllCardsMenu(true);
  };

  const openSortMenu = () => {
    // Ne pas ouvrir si la liste est vide
    if (cards.length === 0) {
      setShowActions(false);
      return;
    }
    setShowActions(false);
    setShowSortMenu(true);
  };

  const createCopyList = () => {
    const newListName = copyListName.trim();
    if (!newListName) return;

    // Copier les cartes
    const copiedCards = cards.map(card => ({
      ...card,
      id: (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : Date.now().toString() + Math.random(),
    }));

    // Dispatcher un événement pour créer la nouvelle liste
    window.dispatchEvent(
      new CustomEvent('epitrello:list-copied', {
        detail: {
          sourceListId: list.id,
          newListTitle: newListName,
          cards: copiedCards,
          boardId: 'current', // Toujours le board courant
        },
      })
    );

    setShowCopyMenu(false);
    setCopyListName("");
  };

  const moveList = () => {
    const position = parseInt(movePosition, 10);
    
    // Dispatcher un événement pour déplacer la liste
    window.dispatchEvent(
      new CustomEvent('epitrello:list-moved', {
        detail: {
          listId: list.id,
          newPosition: position,
          boardId: 'current', // TODO: Gérer plusieurs boards
        },
      })
    );

    setShowMoveMenu(false);
  };

  const moveAllCards = () => {
    if (!targetListId) return;

    // Dispatcher un événement pour déplacer toutes les cartes
    window.dispatchEvent(
      new CustomEvent('epitrello:move-all-cards', {
        detail: {
          sourceListId: list.id,
          targetListId: targetListId,
          cards: [...cards], // Conserver l'ordre actuel
        },
      })
    );

    // Vider la colonne source
    setCards([]);
    setShowMoveAllCardsMenu(false);
  };

  const applySortOption = (sortOption: string) => {
    setActiveSortOption(sortOption);
    
    const sortedCards = [...cards];
    
    switch (sortOption) {
      case 'date-newest':
        // Trier par date de création (plus récent en premier)
        // Assumer que les cartes ont un id qui reflète l'ordre de création
        sortedCards.reverse();
        break;
      
      case 'date-oldest':
        // Trier par date de création (plus ancien en premier)
        // Ordre naturel
        break;
      
      case 'due-date':
        // Trier par date d'échéance
        // TODO: Implémenter quand les cartes auront un champ dueDate
        sortedCards.sort((a, b) => {
          // Placeholder: trier par titre pour l'instant
          return a.title.localeCompare(b.title);
        });
        break;
      
      case 'alpha-asc':
        // Trier alphabétiquement A → Z
        sortedCards.sort((a, b) => a.title.localeCompare(b.title));
        break;
      
      case 'alpha-desc':
        // Trier alphabétiquement Z → A
        sortedCards.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    
    setCards(sortedCards);
    setLastLocalChange(Date.now());
    setShowSortMenu(false);
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
      onMouseEnter={() => setIsHoveringColumn(true)}
      onMouseLeave={() => setIsHoveringColumn(false)}
      className={`w-[272px] min-w-[272px] flex-shrink-0 ${isDragOver ? 'bg-white ring-2 ring-indigo-200' : 'bg-gray-100'} rounded-md shadow-sm flex flex-col animate-slide-in`}
      style={{ height: '100%', maxHeight: '100%' }}
    >
      {/* Header fixe de la colonne */}
      <div className="p-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          {!editing ? (
            <h3
              className="font-medium text-gray-800 text-sm cursor-text flex-1"
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
              className="flex-1 bg-white text-gray-900 text-sm rounded px-2 py-1 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
            />
          )}
          
          {/* Bouton d'actions (⋯) */}
          <div className="relative">
            <button
              ref={actionsButtonRef}
              onClick={() => setShowActions(!showActions)}
              className={`p-1.5 rounded transition-all duration-200 hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                isHoveringColumn ? 'opacity-100' : 'opacity-30'
              }`}
              title="Column actions"
              aria-label="Column actions menu"
              aria-expanded={showActions}
              aria-haspopup="true"
            >
              <svg 
                className="w-4 h-4 text-gray-600" 
                fill="currentColor" 
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <circle cx="2" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="14" cy="8" r="1.5" />
              </svg>
            </button>

            {/* Menu d'actions flottant */}
            {showActions && !showCopyMenu && !showMoveMenu && !showMoveAllCardsMenu && !showSortMenu && (
              <div
                ref={actionsMenuRef}
                className="absolute right-0 top-full mt-1 w-60 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-down overflow-hidden"
                role="menu"
              >
                {/* En-tête du menu */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700">List actions</h4>
                </div>

                {/* Options du menu */}
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                    role="menuitem"
                    onClick={() => {
                      setShowActions(false);
                      setAddingCard(true);
                    }}
                  >
                    Add card
                  </button>
                  
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                    role="menuitem"
                    onClick={openCopyMenu}
                  >
                    Copy list
                  </button>

                  <button
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      totalListsCount <= 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
                    }`}
                    role="menuitem"
                    onClick={openMoveMenu}
                    disabled={totalListsCount <= 1}
                    title={totalListsCount <= 1 ? 'No other lists available' : ''}
                    aria-disabled={totalListsCount <= 1}
                  >
                    Move list
                  </button>

                  <button
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      totalListsCount <= 1 || cards.length === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
                    }`}
                    role="menuitem"
                    onClick={openMoveAllCardsMenu}
                    disabled={totalListsCount <= 1 || cards.length === 0}
                    title={
                      totalListsCount <= 1
                        ? 'No other lists available'
                        : cards.length === 0
                        ? 'No cards to move'
                        : ''
                    }
                    aria-disabled={totalListsCount <= 1 || cards.length === 0}
                  >
                    Move all cards in this list
                  </button>

                  <button
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                      cards.length === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
                    }`}
                    role="menuitem"
                    onClick={openSortMenu}
                    disabled={cards.length === 0}
                    title={cards.length === 0 ? 'No cards to sort' : ''}
                    aria-disabled={cards.length === 0}
                  >
                    <span>Sort by…</span>
                    {activeSortOption && cards.length > 0 && (
                      <span className="text-xs text-indigo-600 font-medium" aria-label="Sort active">●</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Sous-menu : Copy list */}
            {showCopyMenu && (
              <div
                ref={actionsMenuRef}
                className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-down overflow-hidden"
                role="dialog"
                aria-label="Copy list"
              >
                {/* En-tête */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">Copy list</h4>
                  <button
                    onClick={() => setShowCopyMenu(false)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded transition-colors"
                    aria-label="Close copy list dialog"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                </div>

                {/* Corps */}
                <div className="p-4 space-y-4">
                  {/* Nom de la liste */}
                  <div>
                    <label htmlFor="copy-list-name" className="block text-xs font-medium text-gray-700 mb-1.5">
                      List name
                    </label>
                    <input
                      id="copy-list-name"
                      ref={copyNameInputRef}
                      type="text"
                      value={copyListName}
                      onChange={(e) => setCopyListName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          createCopyList();
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                      placeholder="Enter list name"
                      aria-required="true"
                    />
                  </div>

                  {/* Bouton de création */}
                  <button
                    onClick={createCopyList}
                    disabled={!copyListName.trim()}
                    className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    aria-disabled={!copyListName.trim()}
                  >
                    Create copy
                  </button>
                </div>
              </div>
            )}

            {/* Sous-menu : Move list */}
            {showMoveMenu && (
              <div
                ref={actionsMenuRef}
                className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-down overflow-hidden"
                role="dialog"
                aria-label="Move list"
              >
                {/* En-tête */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">Move list</h4>
                  <button
                    onClick={() => setShowMoveMenu(false)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded transition-colors"
                    aria-label="Close move list dialog"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                </div>

                {/* Corps */}
                <div className="p-4 space-y-4">
                  {/* Message d'information */}
                  {totalListsCount <= 1 && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs text-blue-800">
                        ℹ️ There are no other lists to move to. Create another list first.
                      </p>
                    </div>
                  )}

                  {/* Sélecteur de board */}
                  <div>
                    <label htmlFor="move-list-board" className="block text-xs font-medium text-gray-700 mb-1.5">
                      Board
                    </label>
                    <select
                      id="move-list-board"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                      defaultValue="current"
                      disabled={totalListsCount <= 1}
                      aria-disabled={totalListsCount <= 1}
                    >
                      <option value="current">Current board</option>
                      {/* TODO: Ajouter d'autres boards si nécessaire */}
                    </select>
                  </div>

                  {/* Sélecteur de position */}
                  <div>
                    <label htmlFor="move-list-position" className="block text-xs font-medium text-gray-700 mb-1.5">
                      Position
                    </label>
                    <select
                      id="move-list-position"
                      value={movePosition}
                      onChange={(e) => setMovePosition(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                      disabled={totalListsCount <= 1}
                      aria-disabled={totalListsCount <= 1}
                    >
                      {/* Générer les options dynamiquement selon le nombre de colonnes */}
                      {Array.from({ length: totalListsCount }, (_, i) => (
                        <option key={i} value={i.toString()}>
                          {i + 1} {i === 0 ? '(first)' : i === totalListsCount - 1 ? '(last)' : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1.5">
                      Move this list to the selected position ({totalListsCount} total)
                    </p>
                  </div>

                  {/* Bouton de déplacement */}
                  <button
                    onClick={moveList}
                    disabled={totalListsCount <= 1}
                    className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    aria-disabled={totalListsCount <= 1}
                  >
                    Move
                  </button>
                </div>
              </div>
            )}

            {/* Sous-menu : Move all cards in this list */}
            {showMoveAllCardsMenu && (
              <div
                ref={actionsMenuRef}
                className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-down overflow-hidden"
                role="dialog"
                aria-label="Move all cards"
              >
                {/* En-tête */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">Move all cards</h4>
                  <button
                    onClick={() => setShowMoveAllCardsMenu(false)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded transition-colors"
                    aria-label="Close move all cards dialog"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                </div>

                {/* Corps */}
                <div className="p-4 space-y-4">
                  {/* Message d'information si pas d'autres listes */}
                  {totalListsCount <= 1 && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs text-blue-800">
                        ℹ️ There are no other lists to move cards to. Create another list first.
                      </p>
                    </div>
                  )}

                  {/* Sélecteur de liste cible */}
                  <div>
                    <label htmlFor="move-cards-destination" className="block text-xs font-medium text-gray-700 mb-1.5">
                      Destination list
                    </label>
                    <select
                      id="move-cards-destination"
                      value={targetListId}
                      onChange={(e) => setTargetListId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                      disabled={totalListsCount <= 1 || cards.length === 0}
                      aria-disabled={totalListsCount <= 1 || cards.length === 0}
                      aria-required="true"
                    >
                      <option value="">Select a list...</option>
                      {/* TODO: Peupler avec les listes disponibles */}
                      <option value="list-1">List 1</option>
                      <option value="list-2">List 2</option>
                      <option value="list-3">List 3</option>
                    </select>
                    {cards.length > 0 && totalListsCount > 1 && (
                      <p className="text-xs text-gray-500 mt-1.5">
                        All {cards.length} card{cards.length !== 1 ? 's' : ''} will be moved to the selected list in their current order
                      </p>
                    )}
                  </div>

                  {/* Avertissement */}
                  {cards.length > 0 && totalListsCount > 1 && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-3">
                      <p className="text-xs text-amber-800">
                        ⚠️ This action cannot be undone. This list will become empty.
                      </p>
                    </div>
                  )}

                  {/* Message si la liste est vide */}
                  {cards.length === 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <p className="text-xs text-gray-600">
                        This list has no cards to move.
                      </p>
                    </div>
                  )}

                  {/* Bouton de déplacement */}
                  <button
                    onClick={moveAllCards}
                    disabled={!targetListId || cards.length === 0 || totalListsCount <= 1}
                    className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    aria-disabled={!targetListId || cards.length === 0 || totalListsCount <= 1}
                  >
                    Move all cards
                  </button>
                </div>
              </div>
            )}

            {/* Sous-menu : Sort by */}
            {showSortMenu && (
              <div
                ref={actionsMenuRef}
                className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-down overflow-hidden"
                role="dialog"
                aria-label="Sort cards"
              >
                {/* En-tête */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">Sort by</h4>
                  <button
                    onClick={() => setShowSortMenu(false)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded transition-colors"
                    aria-label="Close sort dialog"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                </div>

                {/* Options de tri */}
                <div className="py-1">
                  {cards.length === 0 ? (
                    <div className="px-4 py-3">
                      <p className="text-xs text-gray-500 text-center">No cards to sort</p>
                    </div>
                  ) : (
                    <>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors flex items-center justify-between group"
                        onClick={() => applySortOption('date-newest')}
                        role="menuitemradio"
                        aria-checked={activeSortOption === 'date-newest'}
                      >
                        <span className={activeSortOption === 'date-newest' ? 'text-indigo-600 font-medium' : 'text-gray-700'}>
                          Date created (newest first)
                        </span>
                        {activeSortOption === 'date-newest' && (
                          <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                          </svg>
                        )}
                      </button>

                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors flex items-center justify-between group"
                        onClick={() => applySortOption('date-oldest')}
                        role="menuitemradio"
                        aria-checked={activeSortOption === 'date-oldest'}
                      >
                        <span className={activeSortOption === 'date-oldest' ? 'text-indigo-600 font-medium' : 'text-gray-700'}>
                          Date created (oldest first)
                        </span>
                        {activeSortOption === 'date-oldest' && (
                          <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                          </svg>
                        )}
                      </button>

                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors flex items-center justify-between group"
                        onClick={() => applySortOption('due-date')}
                        role="menuitemradio"
                        aria-checked={activeSortOption === 'due-date'}
                      >
                        <span className={activeSortOption === 'due-date' ? 'text-indigo-600 font-medium' : 'text-gray-700'}>
                          Due date
                        </span>
                        {activeSortOption === 'due-date' && (
                          <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                          </svg>
                        )}
                      </button>

                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors flex items-center justify-between group"
                        onClick={() => applySortOption('alpha-asc')}
                        role="menuitemradio"
                        aria-checked={activeSortOption === 'alpha-asc'}
                      >
                        <span className={activeSortOption === 'alpha-asc' ? 'text-indigo-600 font-medium' : 'text-gray-700'}>
                          Alphabetically (A → Z)
                        </span>
                        {activeSortOption === 'alpha-asc' && (
                          <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                          </svg>
                        )}
                      </button>

                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors flex items-center justify-between group"
                        onClick={() => applySortOption('alpha-desc')}
                        role="menuitemradio"
                        aria-checked={activeSortOption === 'alpha-desc'}
                      >
                        <span className={activeSortOption === 'alpha-desc' ? 'text-indigo-600 font-medium' : 'text-gray-700'}>
                          Alphabetically (Z → A)
                        </span>
                        {activeSortOption === 'alpha-desc' && (
                          <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                          </svg>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
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
