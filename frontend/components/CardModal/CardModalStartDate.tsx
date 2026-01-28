'use client';

import React from 'react';
import { formatDueDate } from './utils';

export interface CardModalStartDateProps {
  startDate: string;
}

export function CardModalStartDate({
  startDate,
}: CardModalStartDateProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-trello mb-2">Start date</h3>
      <div className="flex items-center gap-2">
        <div className="text-sm text-trello">
          {formatDueDate(startDate)},{' '}
          {new Date(startDate).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
