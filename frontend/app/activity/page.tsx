'use client';

import React from 'react';
import { useWorkspacesQuery } from '@/lib/queries/workspaces';
import { ActivityContent } from './ActivityContent';

export default function ActivityPage() {
  const { data: workspacesData } = useWorkspacesQuery();
  const workspaces = workspacesData ?? [];
  const subtitle =
    workspaces.length > 0
      ? `Workspaces — ${workspaces.map((w) => w.name).join(', ')}`
      : 'Workspaces';

  return (
    <ActivityContent
      subtitle={subtitle}
      backHref="/dashboard"
    />
  );
}
