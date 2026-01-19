import React from 'react';
import { MenuHeader, CheckIcon } from './MenuCommon';
import { SortOption } from '../types';

type SortMenuProps = {
  cardsCount: number;
  activeSortOption: string | null;
  onClose: () => void;
  onSort: (option: SortOption) => void;
};

type SortOptionItem = {
  value: SortOption;
  label: string;
};

const sortOptions: SortOptionItem[] = [
  { value: 'date-newest', label: 'Date created (newest first)' },
  { value: 'date-oldest', label: 'Date created (oldest first)' },
  { value: 'due-date', label: 'Due date' },
  { value: 'alpha-asc', label: 'Alphabetically (A → Z)' },
  { value: 'alpha-desc', label: 'Alphabetically (Z → A)' },
];

export const SortMenu: React.FC<SortMenuProps> = ({
  cardsCount,
  activeSortOption,
  onClose,
  onSort,
}) => {
  return (
    <div
      className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-down overflow-hidden"
      role="dialog"
      aria-label="Sort cards"
    >
      <MenuHeader title="Sort by" onClose={onClose} />

      <div className="py-1">
        {cardsCount === 0 ? (
          <div className="px-4 py-3">
            <p className="text-xs text-gray-500 text-center">No cards to sort</p>
          </div>
        ) : (
          <>
            {sortOptions.map((option) => (
              <button
                key={option.value}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors flex items-center justify-between group"
                onClick={() => onSort(option.value)}
                role="menuitemradio"
                aria-checked={activeSortOption === option.value}
              >
                <span className={activeSortOption === option.value ? 'text-indigo-600 font-medium' : 'text-gray-700'}>
                  {option.label}
                </span>
                {activeSortOption === option.value && <CheckIcon />}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
