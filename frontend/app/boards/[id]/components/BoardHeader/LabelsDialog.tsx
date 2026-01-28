'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createLabel, deleteLabel } from '@/lib/actions/labels';
import { useBoardLabelsQuery, boardLabelsQueryKey } from '@/lib/queries/labels';
import { toast } from '@/lib/toast';
import { LABEL_COLORS, getLabelDisplayColor } from '@/lib/constants/label-colors';
import { Trash2, Plus } from 'lucide-react';

interface LabelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
}

export function LabelsDialog({ open, onOpenChange, boardId }: LabelsDialogProps) {
  const queryClient = useQueryClient();
  const { data, isLoading: loading, isError, error } = useBoardLabelsQuery(boardId, open);
  const labels = (data ?? []).map((l) => ({ id: l.id, name: l.name, color: l.color }));
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState<string>(LABEL_COLORS[0].name);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isError && error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load labels');
    }
  }, [isError, error]);

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      toast.error('Please enter a label name');
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
      toast.success('Label created successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create label';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLabel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this label?')) {
      return;
    }

    try {
      await deleteLabel(id);
      await queryClient.invalidateQueries({ queryKey: boardLabelsQueryKey(boardId) });
      toast.success('Label deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete label';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-accent">
        <DialogHeader>
          <DialogTitle>Labels</DialogTitle>
          <DialogDescription>
            Manage labels for this board
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {loading ? (
            <div className="text-center py-4">Loading labels...</div>
          ) : (
            <>
              <div className="space-y-2">
                {labels.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No labels yet</p>
                ) : (
                  labels.map((label) => (
                    <div key={label.id} className="flex items-center gap-2 p-2 rounded border border-accent">
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: getLabelDisplayColor(label.color) }}
                      />
                      <span className="flex-1 text-sm">{label.name || 'Unnamed label'}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteLabel(label.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-accent pt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="new-label-name">Create new label</Label>
                  <Input
                    id="new-label-name"
                    placeholder="Label name"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateLabel();
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {LABEL_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setNewLabelColor(c.name)}
                        className={`h-10 rounded border-2 transition-all ${
                          newLabelColor === c.name ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent hover:border-accent'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateLabel} disabled={creating || !newLabelName.trim()} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {creating ? 'Creating...' : 'Create label'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
