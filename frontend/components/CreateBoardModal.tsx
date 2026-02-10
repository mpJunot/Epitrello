'use client';

import React, { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspacesQuery } from '@/lib/queries/workspaces';
import { getBoardTemplates, type BoardTemplate } from '@/lib/actions/boards';
import { LayoutGrid, List } from 'lucide-react';

const BOARD_COLORS = [
  {
    value: 'bg-gradient-to-r from-purple-700 to-purple-500',
    label: 'Purple Gradient',
    preview: 'bg-gradient-to-r from-purple-700 to-purple-500',
  },
  {
    value: 'bg-gradient-to-r from-pink-500 to-purple-400',
    label: 'Pink Purple Gradient',
    preview: 'bg-gradient-to-r from-pink-500 to-purple-400',
  },
  {
    value: 'bg-gradient-to-r from-orange-500 to-red-500',
    label: 'Orange Red Gradient',
    preview: 'bg-gradient-to-r from-orange-500 to-red-500',
  },
  {
    value: 'bg-gradient-to-r from-blue-600 to-blue-400',
    label: 'Blue Gradient',
    preview: 'bg-gradient-to-r from-blue-600 to-blue-400',
  },
  {
    value: 'bg-gradient-to-r from-green-600 to-green-400',
    label: 'Green Gradient',
    preview: 'bg-gradient-to-r from-green-600 to-green-400',
  },
  {
    value: 'bg-gradient-to-r from-indigo-600 to-indigo-400',
    label: 'Indigo Gradient',
    preview: 'bg-gradient-to-r from-indigo-600 to-indigo-400',
  },
];

export default function CreateBoardModal({
  open,
  onClose,
  onCreate,
  initialTemplateId,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    workspaceId?: string;
    visibility?: string;
    background?: string;
    templateId?: string;
  }) => void;
  /** When opening from the template gallery, preselect this template. */
  initialTemplateId?: string;
}) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(
    BOARD_COLORS[1].value,
  );
  const [templates, setTemplates] = useState<BoardTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('blank');
  const { data: workspacesData } = useWorkspacesQuery(!!open);
  const workspaces = (workspacesData ?? []).map((w) => ({
    id: w.id,
    name: w.name,
  }));
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(undefined);
  const [visibility, setVisibility] = useState<string>('personal');
  const effectiveWorkspaceId = workspaceId ?? workspaces[0]?.id;

  useEffect(() => {
    if (open) {
      getBoardTemplates()
        .then(setTemplates)
        .catch(() =>
          setTemplates([
            {
              id: 'blank',
              name: 'Blank',
              description: 'Empty board with To Do, Doing, Done',
              listTitles: ['To Do', 'Doing', 'Done'],
            },
          ])
        );
    }
  }, [open]);

  useEffect(() => {
    if (open && initialTemplateId) {
      queueMicrotask(() => setSelectedTemplateId(initialTemplateId));
    }
  }, [open, initialTemplateId]);

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error('Please provide a name');
      return;
    }
    if (workspaces.length === 0) {
      toast.error('Create a workspace first');
      return;
    }
    onCreate({
      name: name.trim(),
      workspaceId: effectiveWorkspaceId,
      visibility,
      background: selectedColor,
      templateId: selectedTemplateId || undefined,
    });
    setName('');
    setSelectedColor(BOARD_COLORS[1].value);
    setSelectedTemplateId('blank');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setWorkspaceId(undefined);
          onClose();
        }
      }}
    >
      <DialogContent className='border-accent'>
        <DialogHeader>
          <DialogTitle>Create a new board</DialogTitle>
          <DialogDescription>
            Create a new board for your workspace
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='board-name'>Name</Label>
            <Input
              id='board-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Board name'
            />
          </div>

          <div className='space-y-2'>
            <Label>Template</Label>
            <p className='text-sm text-muted-foreground'>
              Choose a layout with predefined lists
            </p>
            <div className='grid grid-cols-2 gap-2'>
              {templates.map((t) => (
                <button
                  key={t.id}
                  type='button'
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-colors hover:bg-accent/50 ${
                    selectedTemplateId === t.id
                      ? 'border-primary bg-primary/5'
                      : 'border-accent'
                  }`}
                >
                  <span className='flex items-center gap-2 font-medium'>
                    <LayoutGrid className='h-4 w-4 shrink-0' />
                    {t.name}
                  </span>
                  <span className='text-xs text-muted-foreground line-clamp-2'>
                    {t.description}
                  </span>
                  <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <List className='h-3 w-3' />
                    {t.listTitles.join(' · ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='board-workspace'>Workspace</Label>
            <Select
              value={effectiveWorkspaceId ?? ''}
              onValueChange={(value) => setWorkspaceId(value)}
              disabled={workspaces.length === 0}
            >
              <SelectTrigger id='board-workspace'>
                <SelectValue
                  placeholder={
                    workspaces.length === 0
                      ? 'No workspace'
                      : 'Select workspace'
                  }
                />
              </SelectTrigger>
              <SelectContent className='border-accent'>
                {workspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='board-visibility'>Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value)}
            >
              <SelectTrigger id='board-visibility'>
                <SelectValue placeholder='Select visibility' />
              </SelectTrigger>
              <SelectContent className='border-accent'>
                <SelectItem value='personal'>Personal</SelectItem>
                <SelectItem value='workspace'>Workspace</SelectItem>
                <SelectItem value='public'>Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Background Color</Label>
            <div className='grid grid-cols-6 gap-2'>
              {BOARD_COLORS.map((color) => (
                <button
                  key={color.value}
                  type='button'
                  onClick={() => setSelectedColor(color.value)}
                  className={`relative h-12 w-full rounded-md transition-all hover:scale-105 ${
                    selectedColor === color.value
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : ''
                  } ${color.preview}`}
                  aria-label={`Select ${color.label} color`}
                  title={color.label}
                >
                  {selectedColor === color.value && (
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <svg
                        className='w-6 h-6 text-white drop-shadow-lg'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={3}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='secondary'
              onClick={() => {
                setName('');
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type='submit'>Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
