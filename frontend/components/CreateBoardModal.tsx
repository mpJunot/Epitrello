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
import { getTemplates } from '@/lib/actions/templates';
import Link from 'next/link';
import { LayoutGrid, LayoutList, ArrowLeft, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/** All 4 predefined templates (fallback when API fails). */
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
  initialStep,
  initialUseTemplate,
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
  /** When set, skip the choice screen and open directly on the form. */
  initialStep?: 'choice' | 'form';
  /** When initialStep is 'form', use template selection. */
  initialUseTemplate?: boolean;
}) {
  type Step = 'choice' | 'templatePicker' | 'form';
  const [step, setStep] = useState<Step>('choice');
  const [useTemplate, setUseTemplate] = useState(false);
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
        if (cancelled) return;
        setTemplates([...predefined, ...custom]);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [open, effectiveWorkspaceId]);

  useEffect(() => {
    if (!open || !initialTemplateId) return;
    const id = requestAnimationFrame(() => {
      setUseTemplate(true);
      setSelectedTemplateId(initialTemplateId);
      setStep('form');
    });
    return () => cancelAnimationFrame(id);
  }, [open, initialTemplateId]);

  useEffect(() => {
    if (!open || initialStep !== 'form') return;
    const id = requestAnimationFrame(() => {
      setUseTemplate(!!initialUseTemplate);
      setStep(initialUseTemplate ? 'templatePicker' : 'form');
    });
    return () => cancelAnimationFrame(id);
  }, [open, initialStep, initialUseTemplate]);

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
      templateId: useTemplate ? selectedTemplateId || undefined : undefined,
    });
    setName('');
    setSelectedColor(BOARD_COLORS[1].value);
    setSelectedTemplateId('blank');
    setStep('choice');
    setUseTemplate(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setWorkspaceId(undefined);
          setStep('choice');
          setUseTemplate(false);
          onClose();
        }
      }}
    >
      <DialogContent className='border-accent max-w-[min(95vw,28rem)] max-h-[90vh] overflow-x-hidden overflow-y-auto'>
        {step === 'choice' ? (
          <>
            <DialogHeader>
              <DialogTitle>Create a new board</DialogTitle>
              <DialogDescription>
                Choose how you want to get started
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-2'>
              <button
                type='button'
                onClick={() => {
                  setUseTemplate(false);
                  setStep('form');
                }}
                className='flex w-full items-start gap-4 rounded-lg border-2 border-primary bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10'
              >
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/20'>
                  <LayoutList className='h-5 w-5 text-primary' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='font-semibold'>Create board</div>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    A board is made up of cards ordered on lists. Use it to
                    manage projects, track information, or organize anything.
                  </p>
                </div>
              </button>
              <button
                type='button'
                onClick={() => {
                  setUseTemplate(true);
                  setStep('templatePicker');
                }}
                className='flex w-full items-start gap-4 rounded-lg border-2 border-accent p-4 text-left transition-colors hover:bg-accent/50'
              >
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent'>
                  <LayoutGrid className='h-5 w-5 text-muted-foreground' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='font-semibold'>Start with a template</div>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    Get started faster with a board template.
                  </p>
                </div>
              </button>
            </div>
          </>
        ) : step === 'templatePicker' ? (
          <div className='flex flex-col h-full max-h-[70vh]'>
            <div className='flex items-center justify-between gap-2 shrink-0 pb-3 border-b border-accent'>
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
              <h2 className='font-semibold text-foreground'>
                Create from template
              </h2>
              <div className='w-10 shrink-0' aria-hidden />
            </div>
            <div className='pt-3 shrink-0 flex items-center gap-2'>
              <span className='font-medium text-sm text-foreground'>
                Top templates
              </span>
              <ChevronDown
                className='h-4 w-4 text-muted-foreground'
                aria-hidden
              />
            </div>
            <ScrollArea className='flex-1 min-h-0 mt-2 -mx-1 px-1'>
              <ul className='space-y-0.5 py-1'>
                {templates.map((t, i) => {
                  const thumbColors = [
                    'bg-gradient-to-br from-amber-400 to-orange-500',
                    'bg-gradient-to-br from-sky-400 to-blue-500',
                    'bg-gradient-to-br from-violet-400 to-purple-500',
                    'bg-gradient-to-br from-emerald-400 to-green-500',
                    'bg-gradient-to-br from-rose-400 to-pink-500',
                    'bg-gradient-to-br from-indigo-400 to-blue-600',
                  ];
                  const thumb = thumbColors[i % thumbColors.length];
                  return (
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
                          className={`h-12 w-12 shrink-0 rounded-md ${thumb} flex items-center justify-center`}
                        >
                          <LayoutGrid className='h-5 w-5 text-white/90' />
                        </span>
                        <span className='font-medium text-sm text-foreground truncate flex-1'>
                          {t.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
            <div className='pt-4 mt-2 border-t border-accent shrink-0 space-y-3'>
              <p className='text-sm text-muted-foreground'>
                See hundreds of templates from the Epitrello community
              </p>
              <Button variant='secondary' className='w-full' asChild>
                <Link href='/templates' onClick={onClose}>
                  <LayoutGrid className='h-4 w-4 mr-2' />
                  Explore templates
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className='space-y-4'>
            <DialogHeader className='flex flex-row items-center gap-2 space-y-0'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='shrink-0'
                onClick={() =>
                  setStep(useTemplate ? 'templatePicker' : 'choice')
                }
                aria-label='Back'
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <div className='min-w-0 flex-1'>
                <DialogTitle>Create a new board</DialogTitle>
                <DialogDescription>
                  {useTemplate
                    ? 'Pick a template and set your board details'
                    : 'Set your board details'}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className='space-y-2'>
              <Label htmlFor='board-name'>Name</Label>
              <Input
                id='board-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Board name'
              />
            </div>

            {useTemplate && (
              <div className='space-y-2'>
                <Label htmlFor='board-template'>Template</Label>
                <p className='text-sm text-muted-foreground'>
                  Choose a layout with predefined lists
                </p>
                <Select
                  value={selectedTemplateId}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger id='board-template'>
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
              <div className='grid grid-cols-3 sm:grid-cols-6 gap-2 min-w-0'>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
