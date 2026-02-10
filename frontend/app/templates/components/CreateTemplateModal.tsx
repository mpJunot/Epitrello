'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspacesQuery } from '@/lib/queries/workspaces';
import {
  createTemplate,
  type CreateTemplateInput,
  type Visibility,
} from '@/lib/actions/templates';
import { toast } from '@/lib/toast';
import { Plus, Trash2 } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultWorkspaceId?: string | null;
};

export function CreateTemplateModal({
  open,
  onClose,
  onSuccess,
  defaultWorkspaceId,
}: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('PRIVATE');
  const [workspaceId, setWorkspaceId] = useState<string | null>(
    defaultWorkspaceId ?? null,
  );
  const [lists, setLists] = useState<{ title: string }[]>([
    { title: 'To Do' },
    { title: 'In Progress' },
    { title: 'Done' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const { data: workspacesData } = useWorkspacesQuery(open);
  const workspaces = (workspacesData ?? []) as { id: string; name: string }[];

  const addList = () => {
    setLists((prev) => [...prev, { title: '' }]);
  };

  const removeList = (index: number) => {
    setLists((prev) => prev.filter((_, i) => i !== index));
  };

  const updateListTitle = (index: number, title: string) => {
    setLists((prev) => prev.map((l, i) => (i === index ? { ...l, title } : l)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    const trimmedLists = lists
      .map((l) => l.title.trim())
      .filter(Boolean)
      .map((title, position) => ({ title, position }));

    if (!trimmedName) {
      toast.error('Name is required');
      return;
    }
    if (trimmedLists.length === 0) {
      toast.error('Add at least one list');
      return;
    }

    setSubmitting(true);
    try {
      const input: CreateTemplateInput = {
        name: trimmedName,
        description: trimmedDesc || 'Board template',
        lists: trimmedLists,
        visibility,
        workspaceId: workspaceId || undefined,
      };
      await createTemplate(input);
      toast.success('Template created');
      setName('');
      setDescription('');
      setLists([
        { title: 'To Do' },
        { title: 'In Progress' },
        { title: 'Done' },
      ]);
      setVisibility('PRIVATE');
      setWorkspaceId(defaultWorkspaceId ?? null);
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create template';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className='border-accent sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Create template</DialogTitle>
          <DialogDescription>
            Define a board template with a name, description and list columns.
            You can use it when creating a new board.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='template-name'>Name</Label>
            <Input
              id='template-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. Sprint planning'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='template-desc'>Description</Label>
            <Input
              id='template-desc'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Short description'
            />
          </div>
          <div className='space-y-2'>
            <Label>Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(v) => setVisibility(v as Visibility)}
            >
              <SelectTrigger className='border-accent'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='border-accent'>
                <SelectItem value='PRIVATE'>Private (only you)</SelectItem>
                <SelectItem value='WORKSPACE'>
                  Workspace (members of the workspace)
                </SelectItem>
                <SelectItem value='PUBLIC'>Public (everyone)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Workspace (optional)</Label>
            <Select
              value={workspaceId ?? 'none'}
              onValueChange={(v) => setWorkspaceId(v === 'none' ? null : v)}
            >
              <SelectTrigger className='border-accent'>
                <SelectValue placeholder='Global template' />
              </SelectTrigger>
              <SelectContent className='border-accent'>
                <SelectItem value='none'>Global (all workspaces)</SelectItem>
                {workspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label>Lists</Label>
              <Button type='button' variant='ghost' size='sm' onClick={addList}>
                <Plus className='h-4 w-4 mr-1' /> Add list
              </Button>
            </div>
            <div className='space-y-2 max-h-48 overflow-y-auto'>
              {lists.map((list, index) => (
                <div key={index} className='flex gap-2 items-center'>
                  <Input
                    value={list.title}
                    onChange={(e) => updateListTitle(index, e.target.value)}
                    placeholder={`List ${index + 1}`}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => removeList(index)}
                    disabled={lists.length <= 1}
                    aria-label='Remove list'
                  >
                    <Trash2 className='h-4 w-4 text-muted-foreground' />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={submitting}>
              {submitting ? 'Creating…' : 'Create template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
