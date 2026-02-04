'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** Use "danger" for danger zone styling */
  variant?: 'default' | 'danger';
}

export function SettingsSection({
  title,
  description,
  children,
  className = '',
  variant = 'default',
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        'space-y-4 p-4 rounded-lg',
        variant === 'danger' && 'border-destructive/50 bg-destructive/5',
        className,
      )}
    >
      <div className='space-y-1 mb-5'>
        <h2
          className={cn(
            'text-lg font-semibold',
            variant === 'danger' && 'text-destructive',
          )}
        >
          {title}
        </h2>
        {description && (
          <p className='text-sm text-muted-foreground'>{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
