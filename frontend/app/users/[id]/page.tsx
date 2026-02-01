'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserQuery, useCurrentUserQuery } from '@/lib/queries/users';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { getInitials } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const userId = typeof params.id === 'string' ? params.id : undefined;
  const { data: user, isLoading: loading, isError } = useUserQuery(userId ?? null);
  const { data: currentUser } = useCurrentUserQuery();
  const isCurrentUser = !!userId && !!currentUser?.id && userId === currentUser.id;

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-background p-4">
        <div className="p-6 w-full max-w-4xl space-y-6 mx-auto flex-1">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="h-full flex flex-col bg-background p-4">
        <div className="p-6 w-full max-w-4xl space-y-6 mx-auto">
          <p className="text-sm text-muted-foreground">User not found.</p>
          <Button variant="link" asChild className="mt-2 p-0">
            <Link href="/activity">Back to Activity</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background p-4">
      <div className="p-6 w-full max-w-4xl space-y-6 mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild aria-label="Back">
            <Link href="/activity">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Member profile</h1>
        </div>

        <Separator />

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name ?? 'User avatar'} />
            <AvatarFallback
              className={`text-white text-lg ${getAvatarColor(
                user.name ?? user.email,
              )}`}
            >
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-lg font-semibold">{user.name ?? 'Unknown user'}</p>
            {isCurrentUser && (
              <p className="text-sm text-muted-foreground">{user.email ?? ''}</p>
            )}
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 max-w-xl">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Full name
            </label>
            <p className="text-sm font-medium">{user.name ?? '—'}</p>
          </div>
          {isCurrentUser && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="text-sm font-medium">{user.email ?? '—'}</p>
            </div>
          )}
        </div>

        {isCurrentUser && (
          <>
            <Separator />
            <Button variant="outline" asChild>
              <Link href="/profile">View full profile and settings</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
