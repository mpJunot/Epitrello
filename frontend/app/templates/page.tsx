'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBoardTemplates } from '@/lib/actions/boards';
import { getTemplates } from '@/lib/actions/templates';
import { useWorkspacesQuery } from '@/lib/queries/workspaces';
import { useCurrentUserQuery } from '@/lib/queries/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  LayoutGrid,
  User,
  Plus,
  Lock,
  Users,
  Globe,
  Eye,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { CreateTemplateModal } from './components/CreateTemplateModal';
import type { Visibility } from '@/lib/actions/templates';

type TemplateDisplay = {
  id: string;
  name: string;
  description: string;
  listTitles: string[];
  visibility?: Visibility;
  /** Set for custom templates; used to show "You" vs "Community" */
  creatorId?: string;
};

const TEMPLATE_PREVIEW_CLASS: Record<string, string> = {
  blank: 'bg-gradient-to-br from-slate-500 to-slate-700',
  kanban: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  sprint: 'bg-gradient-to-br from-amber-500 to-orange-600',
  project: 'bg-gradient-to-br from-emerald-500 to-teal-600',
};

const TEMPLATE_AUTHOR = 'Epitrello';

function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  const config = {
    PRIVATE: { icon: Lock, label: 'Private' },
    WORKSPACE: { icon: Users, label: 'Workspace' },
    PUBLIC: { icon: Globe, label: 'Public' },
  } as const;
  const { icon: Icon, label } = config[visibility];
  return (
    <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
      <Icon className='h-3 w-3' />
      {label}
    </span>
  );
}

export default function TemplateGalleryPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateDisplay[]>([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: workspacesData } = useWorkspacesQuery(true);
  const { data: currentUser } = useCurrentUserQuery();
  const workspaces = (workspacesData ?? []) as { id: string; name: string }[];
  const firstWorkspaceId = workspaces[0]?.id;
  const currentUserId = currentUser?.id ?? null;

  const loadTemplates = useCallback(async (): Promise<TemplateDisplay[]> => {
    try {
      const [predefined, custom] = await Promise.all([
        getBoardTemplates(),
        getTemplates(firstWorkspaceId ?? null),
      ]);
      const predefinedDisplay: TemplateDisplay[] = predefined.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        listTitles: t.listTitles,
      }));
      const customDisplay: TemplateDisplay[] = custom.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        listTitles: t.lists.map((l) => l.title),
        visibility: t.visibility,
        creatorId: t.creatorId,
      }));
      return [...predefinedDisplay, ...customDisplay];
    } catch {
      return [];
    }
  }, [firstWorkspaceId]);

  useEffect(() => {
    let cancelled = false;
    loadTemplates().then((data) => {
      if (!cancelled) setTemplates(data);
    });
    return () => {
      cancelled = true;
    };
  }, [loadTemplates]);

  const refreshTemplates = useCallback(() => {
    loadTemplates().then(setTemplates);
  }, [loadTemplates]);

  const filteredTemplates = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.listTitles.some((l) => l.toLowerCase().includes(q)),
    );
  }, [templates, search]);

  const handleUseTemplate = (templateId: string) => {
    if (firstWorkspaceId) {
      router.push(
        `/workspaces/${firstWorkspaceId}/boards?create=1&template=${encodeURIComponent(templateId)}`,
      );
    } else {
      router.push(
        `/dashboard?create=1&template=${encodeURIComponent(templateId)}`,
      );
    }
  };

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
        <Breadcrumb className='mb-6'>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={
                    firstWorkspaceId
                      ? `/workspaces/${firstWorkspaceId}/boards`
                      : '/dashboard'
                  }
                >
                  {firstWorkspaceId ? 'Boards' : 'Dashboard'}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Template gallery</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header + Search */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <LayoutGrid className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                Board templates
              </h1>
              <p className='text-sm text-muted-foreground'>
                Start from a template to get going faster
              </p>
            </div>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Create template
            </Button>
            <div className='relative w-full sm:w-72'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Find template'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-9 border-accent bg-background'
                aria-label='Search templates'
              />
            </div>
          </div>
        </div>

        <CreateTemplateModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={refreshTemplates}
          defaultWorkspaceId={firstWorkspaceId ?? null}
        />

        {/* Grid */}
        <section>
          <h2 className='sr-only'>Templates</h2>
          {filteredTemplates.length === 0 ? (
            <div className='rounded-xl border border-accent bg-card p-12 text-center text-muted-foreground'>
              {templates.length === 0
                ? 'Loading templates…'
                : 'No template matches your search.'}
            </div>
          ) : (
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {filteredTemplates.map((template) => (
                <article
                  key={template.id}
                  className='group flex flex-col overflow-hidden rounded-xl border border-accent bg-card shadow-sm transition-shadow hover:shadow-md'
                >
                  {/* Preview */}
                  <div
                    className={`relative h-28 shrink-0 ${TEMPLATE_PREVIEW_CLASS[template.id] ?? 'bg-linear-to-br from-violet-500 to-purple-600'}`}
                  >
                    <div className='absolute inset-0 flex items-center justify-center opacity-90'>
                      <span className='rounded-md bg-black/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm'>
                        {template.name}
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-1 flex-col p-4'>
                    <div className='mb-2 flex items-center gap-2'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
                        <User className='h-4 w-4 text-primary' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <h3 className='font-semibold truncate'>
                            {template.name}
                          </h3>
                          {template.visibility && (
                            <VisibilityBadge visibility={template.visibility} />
                          )}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          by{' '}
                          {template.creatorId && template.creatorId === currentUserId
                            ? 'You'
                            : template.creatorId
                              ? 'Community'
                              : TEMPLATE_AUTHOR}
                        </p>
                      </div>
                    </div>
                    <p
                      className='mb-4 text-sm text-muted-foreground line-clamp-3'
                      title={template.description || undefined}
                    >
                      {template.description || 'No description'}
                    </p>
                    <p className='mb-4 text-xs text-muted-foreground'>
                      Lists: {template.listTitles.join(' · ')}
                    </p>
                    <div className='mt-auto flex gap-2'>
                      <Button variant='outline' className='flex-1' asChild>
                        <Link href={`/templates/${template.id}`}>
                          <Eye className='h-4 w-4 mr-2' />
                          View
                        </Link>
                      </Button>
                      <Button
                        className='flex-1'
                        onClick={() => handleUseTemplate(template.id)}
                        disabled={!firstWorkspaceId}
                      >
                        Use template
                      </Button>
                    </div>
                    {!firstWorkspaceId && (
                      <p className='mt-2 text-center text-xs text-muted-foreground'>
                        Create a workspace first to use templates
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
