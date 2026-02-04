'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function SettingsSkeleton() {
  return (
    <div className='flex h-full w-full flex-col p-8 md:p-12'>
      <div className='flex min-h-0 flex-1 flex-col gap-6 w-full max-w-5xl'>
        <div className='shrink-0 space-y-1'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-4 w-64' />
        </div>

        <div className='flex min-h-0 flex-1 flex-row gap-8 w-full'>
          {/* Sidebar */}
          <div className='flex h-full w-52 shrink-0 flex-col gap-1 bg-muted/50 p-1.5'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className='h-10 w-full rounded-md' />
            ))}
          </div>

          {/* Content */}
          <div className='min-w-0 flex-1 space-y-6'>
            <div className='rounded-lg bg-muted/30 p-6 space-y-4'>
              <Skeleton className='h-5 w-24' />
              <Skeleton className='h-4 w-full max-w-md' />
              <div className='space-y-2 pt-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-9 w-full max-w-md' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-9 w-full max-w-md' />
              </div>
              <div className='flex items-start gap-4 pt-2'>
                <Skeleton className='h-24 w-24 shrink-0 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-14' />
                  <Skeleton className='h-9 w-full' />
                </div>
              </div>
              <Skeleton className='h-9 w-28 mt-2' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
