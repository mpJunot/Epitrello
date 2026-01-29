'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getLabelDisplayColor } from '@/lib/constants/label-colors';
import { LabelsPopover } from './LabelsPopover';
import type { Label } from './types';

export interface CardModalLabelsProps {
  assignedLabels: Label[];
  boardId: string;
  onToggleLabel: (label: Label) => void;
}

export function CardModalLabels({
  assignedLabels,
  boardId,
  onToggleLabel,
}: CardModalLabelsProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-trello mb-2">Labels</h3>
      <div className="flex flex-wrap items-center gap-2">
        {assignedLabels.map((label) => (
          <button
            key={label.id}
            type="button"
            onClick={() => onToggleLabel(label)}
            className="inline-block text-xs px-2 py-0.5 rounded shrink-0 text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: getLabelDisplayColor(label.color),
            }}
            title={label.name || 'Untitled'}
          >
            {label.name || 'Untitled'}
          </button>
        ))}
        <LabelsPopover
          boardId={boardId}
          assignedLabels={assignedLabels}
          onToggleLabel={onToggleLabel}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 shrink-0 rounded-full bg-trello-hover hover:bg-trello-border text-trello-secondary"
            >
              <Plus className="w-4 h-4" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
