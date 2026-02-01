'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUserQuery } from '@/lib/queries/users';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { getInitials } from '@/lib/utils';
import { Settings } from 'lucide-react';

export default function ProfilePage() {
  const { data: user, isLoading: loading } = useCurrentUserQuery();

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col p-4">
        <div className="p-6 w-full max-w-4xl space-y-6 mx-auto flex-1">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 max-w-xl">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-4">
      <div className="p-6 w-full max-w-4xl space-y-6 mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Profile and visibility</h1>
            <p className="text-sm text-muted-foreground">
              View your account details. To edit your name or email, go to
              Settings.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/settings" className="inline-flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Edit in Settings
            </Link>
          </Button>
        </div>

        <Separator />

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar} alt={user?.name ?? 'User avatar'} />
            <AvatarFallback
              className={`text-white text-lg ${getAvatarColor(
                user?.name ?? user?.email
              )}`}
            >
              {getInitials(user?.name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-lg font-semibold">
              {user?.name ?? 'Unknown user'}
            </p>
            <p className="text-sm text-muted-foreground">
              {user?.email ?? 'No email'}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 max-w-xl">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Full name
            </label>
            <p className="text-sm font-medium">{user?.name ?? '—'}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="text-sm font-medium">{user?.email ?? '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
