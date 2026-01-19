import React, { useRef, useState } from 'react';
import { useFocusWhen } from '../hooks';
import { MenuHeader } from './MenuCommon';

type CopyListMenuProps = {
  defaultName: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export const CopyListMenu: React.FC<CopyListMenuProps> = ({ defaultName, onClose, onSubmit }) => {
  const [listName, setListName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useFocusWhen(true, inputRef as React.RefObject<HTMLElement>, true);

  const handleSubmit = () => {
    const trimmedName = listName.trim();
    if (trimmedName) {
      onSubmit(trimmedName);
    }
  };

  return (
    <div
      className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-down overflow-hidden"
      role="dialog"
      aria-label="Copy list"
    >
      <MenuHeader title="Copy list" onClose={onClose} />

      <div className="p-4 space-y-4">
        <div>
          <label htmlFor="copy-list-name" className="block text-xs font-medium text-gray-700 mb-1.5">
            List name
          </label>
          <input
            id="copy-list-name"
            ref={inputRef}
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            placeholder="Enter list name"
            aria-required="true"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!listName.trim()}
          className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          aria-disabled={!listName.trim()}
        >
          Create copy
        </button>
      </div>
    </div>
  );
};
