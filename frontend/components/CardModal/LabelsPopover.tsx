'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Tag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBoardLabelsQuery, boardLabelsQueryKey } from '@/lib/queries/labels';
import { createLabel } from '@/lib/actions/labels';
import { toast } from '@/lib/toast';
import { LABEL_COLORS, getLabelDisplayColor } from '@/lib/constants/label-colors';
import type { Label } from './types';

export interface LabelsPopoverProps {
  boardId: string;
  assignedLabels: Label[];
  onToggleLabel: (label: Label) => void;
  triggerVariant?: 'default' | 'ghost';
  /** Custom trigger (e.g. a + icon button). If not set, uses the default "Labels" button. */
  trigger?: React.ReactNode;
}

export function LabelsPopover({
  boardId,
  assignedLabels,
  onToggleLabel,
  triggerVariant = 'default',
  trigger: customTrigger,
}: LabelsPopoverProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState<string>(LABEL_COLORS[0].name);
  const [creating, setCreating] = useState(false);

  const { data: labels = [], isLoading, isError, error } = useBoardLabelsQuery(
    boardId,
    !!boardId && open
  );

  useEffect(() => {
    if (isError && error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load labels');
    }
  }, [isError, error]);

  const isLabelAssigned = (id: string) => assignedLabels.some((l) => l.id === id);

  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || !boardId) {
      if (!newLabelName.trim()) toast.error('Please enter a label name');
      return;
    }
    setCreating(true);
    try {
      await createLabel({
        boardId,
        name: newLabelName.trim(),
        color: newLabelColor || LABEL_COLORS[0].name,
      });
      await queryClient.invalidateQueries({ queryKey: boardLabelsQueryKey(boardId) });
      setNewLabelName('');
      setNewLabelColor(LABEL_COLORS[0].name);
      toast.success('Label created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create label');
    } finally {
      setCreating(false);
    }
  };

  const defaultTrigger = (
    <Button
      variant={triggerVariant === 'ghost' ? 'ghost' : 'secondary'}
      size="sm"
      className={
        triggerVariant === 'ghost'
          ? 'w-full justify-start text-sm'
          : 'text-sm bg-muted hover:bg-muted/80 text-foreground rounded-md'
      }
    >
      <Tag className="w-4 h-4 mr-1" />
      Labels
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{customTrigger ?? defaultTrigger}</PopoverTrigger>
      <PopoverContent
        className="w-64 p-0 bg-trello-card-bg border-accent max-h-[min(24rem,70vh)] flex flex-col overflow-hidden"
        align="start"
        sideOffset={4}
      >
        <div className="p-3 flex flex-col min-h-0 flex-1">
          <h4 className="text-sm font-semibold text-trello mb-3 shrink-0">Labels</h4>

          {!boardId ? (
            <p className="text-xs text-muted-foreground shrink-0">No board selected.</p>
          ) : isLoading ? (
            <p className="text-xs text-muted-foreground shrink-0">Loading...</p>
          ) : (
            <div className="space-y-2 flex-1 min-h-0 max-h-48 overflow-y-auto overflow-x-hidden custom-scrollbar">
              {labels.length === 0 ? (
                <p className="text-xs text-muted-foreground">No labels yet. Create one below.</p>
              ) : (
                labels.map((label) => {
                  const isAssigned = isLabelAssigned(label.id);
                  return (
                    <div
                      key={label.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onToggleLabel(label)}
                      onKeyDown={(e) => e.key === 'Enter' && onToggleLabel(label)}
                      className="flex items-center gap-2 w-full h-9 px-2 rounded cursor-pointer transition-all"
                      style={{ backgroundColor: getLabelDisplayColor(label.color) }}
                    >
                      <span
                        className="shrink-0 flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isAssigned}
                          onCheckedChange={() => onToggleLabel(label)}
                          className="border-white/80 data-[state=checked]:border-white data-[state=checked]:bg-white/90"
                        />
                      </span>
                      <span className="flex-1 text-left truncate text-white text-sm">
                        {label.name || 'Untitled'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Create label */}
          {boardId && (
            <div className="mt-3 pt-3 border-t border-accent space-y-2 shrink-0">
              <Input
                placeholder="New label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
                className="h-8 text-sm"
              />
              <div className="grid grid-cols-5 gap-1.5">
                {LABEL_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setNewLabelColor(c.name)}
                    className={`h-7 rounded border-2 transition-all ${
                      newLabelColor === c.name
                        ? 'border-primary ring-1 ring-primary ring-offset-1'
                        : 'border-transparent hover:border-accent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={handleCreateLabel}
                disabled={creating || !newLabelName.trim()}
              >
                <Plus className="w-4 h-4 mr-1" />
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
