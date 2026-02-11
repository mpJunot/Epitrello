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
import { useWorkspacesQuery } from '@/lib/queries/workspaces';
import { getBoardTemplates, type BoardTemplate } from '@/lib/actions/boards';
import { getTemplates } from '@/lib/actions/templates';
import Link from 'next/link';
import {
  LayoutGrid,
  LayoutList,
  ArrowLeft,
  ChevronDown,
  X,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const FALLBACK_PREDEFINED_TEMPLATES: BoardTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty board with To Do, Doing, Done',
    listTitles: ['To Do', 'Doing', 'Done'],
  },
  {
    id: 'kanban',
    name: 'Kanban',
    description: 'Classic Kanban: To Do, In Progress, Done',
    listTitles: ['To Do', 'In Progress', 'Done'],
  },
  {
    id: 'sprint',
    name: 'Sprint',
    description: 'Agile sprint: Backlog, To Do, In Progress, In Review, Done',
    listTitles: ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'],
  },
  {
    id: 'project',
    name: 'Project',
    description: 'Project tracking: To Do, In Progress, Blocked, Done',
    listTitles: ['To Do', 'In Progress', 'Blocked', 'Done'],
  },
];

const BOARD_COLORS = [
  {
    value: 'bg-gradient-to-r from-purple-700 to-purple-500',
    label: 'Purple',
    preview: 'bg-gradient-to-r from-purple-700 to-purple-500',
  },
  {
    value: 'bg-gradient-to-r from-pink-500 to-purple-400',
    label: 'Pink Purple',
    preview: 'bg-gradient-to-r from-pink-500 to-purple-400',
  },
  {
    value: 'bg-gradient-to-r from-orange-500 to-red-500',
    label: 'Orange Red',
    preview: 'bg-gradient-to-r from-orange-500 to-red-500',
  },
  {
    value: 'bg-gradient-to-r from-blue-600 to-blue-400',
    label: 'Blue',
    preview: 'bg-gradient-to-r from-blue-600 to-blue-400',
  },
  {
    value: 'bg-gradient-to-r from-green-600 to-green-400',
    label: 'Green',
    preview: 'bg-gradient-to-r from-green-600 to-green-400',
  },
  {
    value: 'bg-gradient-to-r from-indigo-600 to-indigo-400',
    label: 'Indigo',
    preview: 'bg-gradient-to-r from-indigo-600 to-indigo-400',
  },
];

const THUMB_COLORS = [
  'bg-gradient-to-br from-amber-400 to-orange-500',
  'bg-gradient-to-br from-sky-400 to-blue-500',
  'bg-gradient-to-br from-violet-400 to-purple-500',
  'bg-gradient-to-br from-emerald-400 to-green-500',
  'bg-gradient-to-br from-rose-400 to-pink-500',
  'bg-gradient-to-br from-indigo-400 to-blue-600',
];

export type CreateBoardPayload = {
  name: string;
  workspaceId?: string;
  visibility?: string;
  background?: string;
  templateId?: string;
};

export default function CreateBoardPopoverContent({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateBoardPayload) => void;
}) {
  type Step = 'choice' | 'templatePicker' | 'form';
  const [step, setStep] = useState<Step>('choice');
  const [useTemplate, setUseTemplate] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[1].value);
  const [templates, setTemplates] = useState<BoardTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('blank');
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(undefined);
  const [visibility, setVisibility] = useState('personal');

  const { data: workspacesData } = useWorkspacesQuery(!!open);
  const workspaces = (workspacesData ?? []).map((w) => ({
    id: w.id,
    name: w.name,
  }));
  const effectiveWorkspaceId = workspaceId ?? workspaces[0]?.id;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const predefinedPromise = getBoardTemplates().catch(
      () => FALLBACK_PREDEFINED_TEMPLATES,
    );
    const customPromise = effectiveWorkspaceId
      ? getTemplates(effectiveWorkspaceId)
          .then((list) =>
            list.map((t) => ({
              id: t.id,
              name: t.name,
              description: t.description ?? '',
              listTitles: (t.lists ?? []).map((l) => l.title),
            })),
          )
          .catch(() => [])
      : Promise.resolve<BoardTemplate[]>([]);
    Promise.all([predefinedPromise, customPromise]).then(
      ([predefined, custom]) => {
        if (!cancelled) setTemplates([...predefined, ...custom]);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [open, effectiveWorkspaceId]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
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
      templateId: useTemplate ? selectedTemplateId || undefined : undefined,
    });
    setStep('choice');
    setUseTemplate(false);
    setName('');
    setSelectedTemplateId('blank');
    onClose();
  };

  if (step === 'choice') {
    return (
      <div className='py-1'>
        <button
          type='button'
          onClick={() => {
            setUseTemplate(false);
            setStep('form');
          }}
          className='flex w-full items-start gap-4 px-4 py-3 text-left transition-colors hover:bg-accent/50 focus:bg-accent/50 focus:outline-none rounded-t-lg'
        >
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/20'>
            <LayoutList className='h-5 w-5 text-primary' />
          </div>
          <div className='min-w-0 flex-1 pt-0.5'>
            <div className='font-semibold text-foreground'>Create board</div>
            <p className='mt-1 text-sm text-muted-foreground'>
              A board is made up of cards ordered on lists. Use it to manage
              projects, track information, or organize anything.
            </p>
          </div>
        </button>
        <div className='h-px bg-border mx-4' />
        <button
          type='button'
          onClick={() => {
            setUseTemplate(true);
            setStep('templatePicker');
          }}
          className='flex w-full items-start gap-4 px-4 py-3 text-left transition-colors hover:bg-accent/50 focus:bg-accent/50 focus:outline-none rounded-b-lg'
        >
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent'>
            <LayoutGrid className='h-5 w-5 text-muted-foreground' />
          </div>
          <div className='min-w-0 flex-1 pt-0.5'>
            <div className='font-semibold text-foreground'>
              Start with a template
            </div>
            <p className='mt-1 text-sm text-muted-foreground'>
              Get started faster with a board template.
            </p>
          </div>
        </button>
      </div>
    );
  }

  if (step === 'templatePicker') {
    return (
      <div className='flex flex-col min-h-0'>
        <div className='flex items-center justify-between gap-2 shrink-0 py-3 px-1 border-b border-accent'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='shrink-0 -ml-2'
            onClick={() => setStep('choice')}
            aria-label='Back'
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <h2 className='font-semibold text-foreground text-sm'>
            Create from template
          </h2>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='shrink-0 -mr-2'
            onClick={onClose}
            aria-label='Close'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
        <div className='pt-3 px-4 shrink-0 flex items-center gap-2'>
          <span className='font-medium text-sm text-foreground'>
            Top templates
          </span>
          <ChevronDown className='h-4 w-4 text-muted-foreground' aria-hidden />
        </div>
        <div className='h-[200px] shrink-0 mt-2 overflow-hidden'>
          <ScrollArea className='h-full w-full'>
            <ul className='space-y-0.5 py-1 px-4 pr-2'>
              {templates.map((t, i) => (
                <li key={t.id}>
                  <button
                    type='button'
                    onClick={() => {
                      setSelectedTemplateId(t.id);
                      setStep('form');
                    }}
                    className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/60 focus:bg-accent/60 focus:outline-none'
                  >
                    <span
                      className={`h-12 w-12 shrink-0 rounded-md ${THUMB_COLORS[i % THUMB_COLORS.length]} flex items-center justify-center`}
                    >
                      <LayoutGrid className='h-5 w-5 text-white/90' />
                    </span>
                    <span className='font-medium text-sm text-foreground truncate flex-1 min-w-0'>
                      {t.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
        <div className='shrink-0 pt-4 pb-4 px-4 mt-2 border-t border-accent bg-card space-y-3'>
          <p className='text-sm text-muted-foreground leading-snug'>
            See hundreds of templates from the Epitrello community
          </p>
          <Button
            variant='secondary'
            className='w-full inline-flex items-center justify-center gap-2'
            asChild
          >
            <Link
              href='/templates'
              onClick={onClose}
              className='inline-flex items-center gap-2'
            >
              <LayoutGrid className='h-4 w-4 shrink-0' />
              <span>Explore templates</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-0'>
      <div className='flex items-center gap-2 shrink-0 py-2 px-1 border-b border-accent'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='shrink-0 -ml-2'
          onClick={() => setStep(useTemplate ? 'templatePicker' : 'choice')}
          aria-label='Back'
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div className='min-w-0 flex-1'>
          <h2 className='font-semibold text-foreground text-sm'>
            Create a new board
          </h2>
          <p className='text-xs text-muted-foreground'>
            {useTemplate
              ? 'Pick a template and set your board details'
              : 'Set your board details'}
          </p>
        </div>
      </div>
      <div className='overflow-y-auto overflow-x-hidden min-h-0 px-4'>
        <form onSubmit={submit} className='space-y-4 pt-3 pb-4'>
          <div className='space-y-2'>
            <Label htmlFor='popover-board-name'>Name</Label>
            <Input
              id='popover-board-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Board name'
            />
          </div>
          {useTemplate && (
            <div className='space-y-2'>
              <Label htmlFor='popover-board-template'>Template</Label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger id='popover-board-template'>
                  <SelectValue placeholder='Select a template' />
                </SelectTrigger>
                <SelectContent className='border-accent'>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor='popover-board-workspace'>Workspace</Label>
            <Select
              value={effectiveWorkspaceId ?? ''}
              onValueChange={(v) => setWorkspaceId(v)}
              disabled={workspaces.length === 0}
            >
              <SelectTrigger id='popover-board-workspace'>
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
            <Label htmlFor='popover-board-visibility'>Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger id='popover-board-visibility'>
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
            <Label>Background</Label>
            <div className='grid grid-cols-6 gap-2'>
              {BOARD_COLORS.map((color) => (
                <button
                  key={color.value}
                  type='button'
                  onClick={() => setSelectedColor(color.value)}
                  className={`relative h-10 w-full rounded-md transition-all hover:scale-105 ${selectedColor === color.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''} ${color.preview}`}
                  aria-label={color.label}
                  title={color.label}
                >
                  {selectedColor === color.value && (
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <svg
                        className='w-5 h-5 text-white drop-shadow-lg'
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
          <div className='flex gap-2 pt-2'>
            <Button
              type='button'
              variant='secondary'
              onClick={onClose}
              className='flex-1'
            >
              Cancel
            </Button>
            <Button type='submit' className='flex-1'>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
