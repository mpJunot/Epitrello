import React from 'react';
import { MenuHeader, CheckIcon } from './MenuCommon';
import { SortOption } from '../types';
import { Button } from "@/components/ui/button";

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
      className="absolute right-0 top-full mt-1 w-64 bg-trello-card-bg rounded-lg shadow-lg border border-accent z-50 animate-slide-down overflow-hidden"
      role="dialog"
      aria-label="Sort cards"
    >
      <MenuHeader title="Sort by" onClose={onClose} />

      <div className="py-1">
        {cardsCount === 0 ? (
          <div className="px-4 py-3">
            <p className="text-xs text-trello-text-secondary text-center">No cards to sort</p>
          </div>
        ) : (
          <>
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                className="w-full justify-between"
                onClick={() => onSort(option.value)}
                role="menuitemradio"
                aria-checked={activeSortOption === option.value}
              >
                <span className={activeSortOption === option.value ? 'text-trello-blue font-medium' : 'text-trello'}>
                  {option.label}
                </span>
                {activeSortOption === option.value && <CheckIcon />}
              </Button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
