'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUserQuery } from '@/lib/queries/users';
import { getAvatarColor } from '@/lib/utils/avatar-colors';
import { getInitials } from '@/lib/utils';
import { Settings } from 'lucide-react';

export default function ProfilePage() {
  const { data: user, isLoading: loading } = useCurrentUserQuery();

  if (loading) {
    return (
      <div className='h-full flex flex-col bg-background p-6 md:p-10'>
        <div className='w-full max-w-2xl mx-auto flex-1 space-y-8'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <Skeleton className='h-8 w-56' />
            <Skeleton className='h-9 w-36' />
          </div>
          <div className='rounded-xl border border-accent bg-card p-8'>
            <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
              <Skeleton className='h-28 w-28 rounded-full shrink-0' />
              <div className='flex-1 w-full space-y-3 text-center sm:text-left'>
                <Skeleton className='h-7 w-48 mx-auto sm:mx-0' />
                <Skeleton className='h-4 w-64 mx-auto sm:mx-0' />
                <Skeleton className='h-12 w-full mt-4' />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasBio = Boolean(user?.description?.trim());

  return (
    <div className='h-full flex flex-col bg-background p-6 md:p-10'>
      <div className='w-full max-w-2xl mx-auto flex-1 space-y-8'>
        <header className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Profile and visibility
            </h1>
            <p className='text-sm text-muted-foreground'>
              Your public profile. Edit your details in Settings.
            </p>
          </div>
          <Button variant='outline' size='sm' asChild className='shrink-0'>
            <Link href='/settings' className='inline-flex items-center gap-2'>
              <Settings className='h-4 w-4' />
              Edit in Settings
            </Link>
          </Button>
        </header>

        <section className='rounded-xl border border-accent bg-card shadow-sm overflow-hidden'>
          <div className='p-8'>
            <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
              <Avatar className='h-28 w-28 shrink-0 ring-2 ring-accent'>
                <AvatarImage
                  src={user?.avatar}
                  className='object-cover'
                  alt={user?.name ?? 'User avatar'}
                />
                <AvatarFallback
                  className={`text-white text-2xl font-medium ${getAvatarColor(
                    user?.name ?? user?.email,
                  )}`}
                >
                  {getInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1 space-y-1 text-center sm:text-left'>
                <h2 className='text-xl font-semibold tracking-tight'>
                  {user?.name ?? 'Unknown user'}
                </h2>
                <p className='text-sm text-muted-foreground'>
                  {user?.email ?? 'No email'}
                </p>
              </div>
            </div>
            {hasBio && (
              <div className='mt-6 pt-6 border-t border-accent'>
                <p className='text-sm font-medium text-muted-foreground mb-1.5'>
                  Bio
                </p>
                <p className='text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap'>
                  {user?.description?.trim()}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
