"use client";

import React, { useRef, useState, useEffect } from "react";
import ListColumn from "./ListColumn";

type Label = { id: string; name?: string; color?: string };
type UserRef = { id: string; name?: string; avatar?: string; email?: string };
type Card = {
  id: string;
  title: string;
  description?: string;
  labels?: Label[];
  assignees?: UserRef[];
};

type Board = {
  id: string;
  title: string;
  description?: string;
  lists?: { id: string; title: string; position?: number; cards?: Card[] }[];
};

export default function BoardView({ board }: { board: Board }) {
  // Use lists directly from props - BoardPage is the single source of truth
  const lists = board.lists || [];

  // Log pour debug
  useEffect(() => {
    console.log('🎨 BoardView: board.lists changed, count:', lists.length);
    lists.forEach((l, idx) => {
      console.log(`  List ${idx}:`, l.id, l.title, 'cards:', l.cards?.length);
      l.cards?.forEach((c, cidx) => {
        console.log(`    Card ${cidx}:`, c.id, c.title);
      });
    });
  }, [board, lists]);

  return (
    <div className="p-4" id="main-board-content">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">{board.title}</h2>
          {board.description && <div className="text-sm text-gray-600">{board.description}</div>}
        </div>
      </div>

      {/* Container avec scroll horizontal fluide et responsive */}
      <div 
        className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth snap-x snap-mandatory md:snap-none custom-scrollbar" 
        style={{ height: 'calc(100vh - 200px)' }}
      >
        {lists.map((l) => (
          <div key={l.id} className="snap-center md:snap-align-none">
            <ListColumn list={l} totalListsCount={lists.length} allLists={lists} />
          </div>
        ))}

        {/* Add-column interactive element */}
        <div className="w-[272px] min-w-[272px] flex-shrink-0 p-3 rounded-md snap-center md:snap-align-none">
          <AddListInline />
        </div>
      </div>
    </div>
  );
}

function AddListInline() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const openInput = () => setOpen(true);
  const close = () => {
    setOpen(false);
    setValue("");
    // return focus to the add button
    setTimeout(() => buttonRef.current?.focus(), 0);
  };

  const submit = async () => {
    const title = value?.trim();
    if (!title) {
      setError(true);
      setTimeout(() => setError(false), 500);
      return;
    }
    setLoading(true);
    window.dispatchEvent(new CustomEvent("epitrello:list-create", { detail: { title } }));
    // Don't close yet - let the parent handle success/failure
    // close() will be called by the parent via a success event
  };
  
  const handleSuccess = () => {
    setLoading(false);
    close();
  };
  
  const handleError = () => {
    setLoading(false);
    setError(true);
    setTimeout(() => setError(false), 500);
  };
  
  useEffect(() => {
    window.addEventListener('epitrello:list-create-success', handleSuccess);
    window.addEventListener('epitrello:list-create-error', handleError);
    return () => {
      window.removeEventListener('epitrello:list-create-success', handleSuccess);
      window.removeEventListener('epitrello:list-create-error', handleError);
    };
  }, []);

  return (
    <div>
      {!open ? (
        <button
          ref={buttonRef}
          onClick={openInput}
          className="w-full text-left px-3 py-2 rounded bg-transparent hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-300 text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Add another list"
        >
          + Add another list
        </button>
      ) : (
        <div className={`bg-transparent ${error ? 'animate-shake' : ''}`}>
          <input
            ref={inputRef}
            placeholder="Enter list title"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                close();
              }
            }}
            className={`w-full px-3 py-2 rounded border ${
              error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
            } text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors`}
          />
          {error && (
            <p className="text-xs text-red-600 mt-1">Le titre est requis</p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={submit}
              disabled={loading}
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 active:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Add list'}
            </button>
            <button
              onClick={close}
              className="px-2 py-1 text-sm text-gray-600 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Cancel add list"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
