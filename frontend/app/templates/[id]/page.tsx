'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getTemplate } from '@/lib/actions/templates';
import { getBoardTemplates } from '@/lib/actions/boards';
import { useWorkspacesQuery } from '@/lib/queries/workspaces';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  Lock,
  Users,
  Globe,
  List,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { Template } from '@/lib/actions/templates';
import type { Visibility } from '@/lib/graphql-types';

const TEMPLATE_PREVIEW_CLASS: Record<string, string> = {
  blank: 'bg-gradient-to-br from-slate-500 to-slate-700',
  kanban: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  sprint: 'bg-gradient-to-br from-amber-500 to-orange-600',
  project: 'bg-gradient-to-br from-emerald-500 to-teal-600',
};

function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  const config = {
    PRIVATE: { icon: Lock, label: 'Private' },
    WORKSPACE: { icon: Users, label: 'Workspace' },
    PUBLIC: { icon: Globe, label: 'Public' },
  } as const;
  const { icon: Icon, label } = config[visibility];
  return (
    <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground'>
      <Icon className='h-3.5 w-3.5' />
      {label}
    </span>
  );
}

type TemplateDetail =
  | Template
  | { id: string; name: string; description: string; listTitles: string[] };

function isFullTemplate(t: TemplateDetail): t is Template {
  return 'lists' in t && Array.isArray((t as Template).lists);
}

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: workspacesData } = useWorkspacesQuery(!!id);
  const workspaces = (workspacesData ?? []) as { id: string; name: string }[];
  const firstWorkspaceId = workspaces[0]?.id;

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing template id');
      return;
    }
    let cancelled = false;
    const PREDEFINED_IDS = new Set(['blank', 'kanban', 'sprint', 'project']);
    (async () => {
      try {
        const predefinedList = await getBoardTemplates();
        const predefined = predefinedList.find((t) => t.id === id);
        if (!cancelled && predefined) {
          setTemplate({
            id: predefined.id,
            name: predefined.name,
            description: predefined.description,
            listTitles: predefined.listTitles ?? [],
          });
          setError(null);
          return;
        }
        if (PREDEFINED_IDS.has(id)) {
          if (!cancelled) {
            setError('Template not found');
            setTemplate(null);
          }
          return;
        }
        const custom = await getTemplate(id);
        if (!cancelled && custom?.id) {
          setTemplate(custom);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load template');
          setTemplate(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleUseTemplate = () => {
    if (firstWorkspaceId) {
      router.push(
        `/workspaces/${firstWorkspaceId}/boards?create=1&template=${encodeURIComponent(id)}`,
      );
    } else {
      router.push(`/dashboard?create=1&template=${encodeURIComponent(id)}`);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full' />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className='min-h-screen bg-background px-4 py-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <p className='text-muted-foreground mb-4'>
            {error ?? 'Template not found'}
          </p>
          <Button asChild variant='outline'>
            <Link href='/templates'>Back to templates</Link>
          </Button>
        </div>
      </div>
    );
  }

  const fullTemplate = isFullTemplate(template);
  const gradientClass =
    TEMPLATE_PREVIEW_CLASS[template.id] ??
    'bg-gradient-to-br from-violet-500 to-purple-600';

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6'>
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
              <BreadcrumbLink asChild>
                <Link href='/templates'>Templates</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className='truncate max-w-[200px] sm:max-w-none'>
                {template.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex gap-4'>
            <div
              className={`h-20 w-20 shrink-0 rounded-xl ${gradientClass} flex items-center justify-center`}
            >
              <LayoutGrid className='h-10 w-10 text-white/90' />
            </div>
            <div className='min-w-0'>
              <h1 className='text-2xl font-semibold tracking-tight truncate'>
                {template.name}
              </h1>
              {fullTemplate && 'visibility' in template && (
                <div className='mt-2'>
                  <VisibilityBadge visibility={template.visibility} />
                </div>
              )}
              {template.description ? (
                <p className='mt-2 text-sm text-muted-foreground whitespace-pre-wrap'>
                  {template.description}
                </p>
              ) : null}
            </div>
          </div>
          <div className='flex gap-2 shrink-0'>
            <Button variant='outline' asChild>
              <Link href='/templates'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back
              </Link>
            </Button>
            <Button onClick={handleUseTemplate} disabled={!firstWorkspaceId}>
              Use this template
            </Button>
          </div>
        </div>

        {/* Lists & cards */}
        <section className='rounded-xl border border-accent bg-card overflow-hidden'>
          <div className='border-b border-accent px-4 py-3 flex items-center gap-2'>
            <List className='h-4 w-4 text-muted-foreground' />
            <h2 className='font-medium'>Structure</h2>
          </div>
          <div className='p-4'>
            {fullTemplate ? (
              template.lists?.length ? (
                <div className='space-y-4'>
                  {[...template.lists]
                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                    .map((list, index) => (
                      <div
                        key={`${list.title}-${index}`}
                        className='rounded-lg border border-accent bg-muted/30 overflow-hidden'
                      >
                        <div className='px-4 py-2.5 bg-muted/50 border-b border-accent font-medium text-sm flex items-center gap-2'>
                          <span className='rounded bg-primary/20 px-1.5 py-0.5 text-xs text-primary'>
                            List {index + 1}
                          </span>
                          {list.title}
                        </div>
                        {list.sampleCards && list.sampleCards.length > 0 ? (
                          <ul className='divide-y divide-accent'>
                            {[...list.sampleCards]
                              .sort(
                                (a, b) => (a.position ?? 0) - (b.position ?? 0),
                              )
                              .map((card, cardIndex) => (
                                <li
                                  key={`${card.title}-${cardIndex}`}
                                  className='px-4 py-2.5 flex items-center gap-2 text-sm'
                                >
                                  <FileText className='h-4 w-4 text-muted-foreground shrink-0' />
                                  <span>{card.title}</span>
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <p className='px-4 py-3 text-sm text-muted-foreground'>
                            No sample cards
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground py-4'>
                  This template has no lists.
                </p>
              )
            ) : (
              <ul className='space-y-2'>
                {'listTitles' in template &&
                  (template.listTitles ?? []).map((title, index) => (
                    <li
                      key={`${title}-${index}`}
                      className='flex items-center gap-2 rounded-lg border border-accent bg-muted/30 px-4 py-2.5'
                    >
                      <span className='rounded bg-primary/20 px-1.5 py-0.5 text-xs text-primary'>
                        {index + 1}
                      </span>
                      <span className='font-medium'>{title}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </section>

        {!firstWorkspaceId && (
          <p className='mt-4 text-center text-sm text-muted-foreground'>
            Create a workspace to use this template when creating a board.
          </p>
        )}
      </div>
    </div>
  );
}
