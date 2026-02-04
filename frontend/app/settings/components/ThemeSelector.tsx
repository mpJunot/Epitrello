'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const THEME_ICON_SIZE = { width: 88, height: 64 };

function ThemeIconLight({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-xl border-2 border-border bg-white p-2', className)}
      style={THEME_ICON_SIZE}
    >
      <div className="flex gap-2 h-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 rounded-md bg-muted-foreground/30" />
        ))}
      </div>
    </div>
  );
}

function ThemeIconDark({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-xl border-2 border-border bg-zinc-800 p-2', className)}
      style={THEME_ICON_SIZE}
    >
      <div className="flex gap-2 h-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 rounded-md bg-zinc-600" />
        ))}
      </div>
    </div>
  );
}

function ThemeIconSystem({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-xl border-2 border-border overflow-hidden', className)}
      style={THEME_ICON_SIZE}
    >
      <div className="h-full w-full relative">
        <div className="absolute inset-0 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        <div className="absolute inset-0 bg-zinc-800" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
      </div>
    </div>
  );
}

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Light', Icon: ThemeIconLight },
  { value: 'dark' as const, label: 'Dark', Icon: ThemeIconDark },
  { value: 'system' as const, label: 'Match system', Icon: ThemeIconSystem },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-2">
      <Label>Appearance (theme)</Label>
      {mounted ? (
        <div className="flex flex-row flex-wrap gap-3 w-full" role="group" aria-label="Theme">
          {THEME_OPTIONS.map(({ value, label, Icon }) => {
            const isSelected = (theme ?? 'system') === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={isSelected}
                className={cn(
                  'flex flex-1 min-w-[140px] items-center justify-center gap-4 rounded-xl border-2 px-6 py-4 text-base transition-colors',
                  'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected
                    ? 'border-primary bg-primary/15 text-primary font-medium'
                    : 'border-input bg-background',
                )}
              >
                <Icon />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <Skeleton className="h-20 w-full max-w-xl rounded-xl" />
      )}
      <p className="text-xs text-muted-foreground">
        Choose light, dark, or follow your system preference.
      </p>
    </div>
  );
}
