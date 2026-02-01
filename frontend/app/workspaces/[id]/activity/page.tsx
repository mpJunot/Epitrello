'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceQuery } from '@/lib/queries/workspaces';
import { ActivityContent } from '@/app/activity/ActivityContent';

export default function WorkspaceActivityPage() {
  const params = useParams();
  const workspaceId = typeof params.id === 'string' ? params.id : undefined;
  const { data: workspace } = useWorkspaceQuery(workspaceId ?? '');

  const subtitle = workspace?.name ?? 'Workspace';
  const backHref = workspaceId ? `/workspaces/${workspaceId}/boards` : '/dashboard';

  return (
    <ActivityContent
      workspaceIds={workspaceId ? [workspaceId] : undefined}
      subtitle={subtitle}
      backHref={backHref}
    />
  );
}
