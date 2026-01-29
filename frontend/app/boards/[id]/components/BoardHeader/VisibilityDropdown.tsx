'use client';

import { Eye, EyeIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getVisibilityLabel, getVisibilityIcon } from './utils';
import { getVisibilityDescription } from '@/components/BoardView';
import { Visibility } from '@/lib/graphql-types';

interface VisibilityDropdownProps {
  visibility: Visibility;
  workspaceName?: string;
  onVisibilityChange?: (visibility: Visibility) => void;
}

export function VisibilityDropdown({
  visibility,
  workspaceName,
  onVisibilityChange,
}: VisibilityDropdownProps) {
  const handleVisibilityChange = (newVisibility: Visibility) => {
    if (onVisibilityChange) {
      onVisibilityChange(newVisibility);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='text-white hover:bg-white/20 h-auto px-2 py-1'
        >
          {getVisibilityIcon(visibility)}
          <span className='ml-1 text-sm'>{getVisibilityLabel(visibility)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='border-accent w-80'>
        <DropdownMenuLabel>Change visibility</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='flex flex-col items-start gap-0.5 py-3'
          onClick={() => handleVisibilityChange('PRIVATE' as Visibility)}
        >
          <div className='flex w-full items-center gap-2'>
            <Eye className='w-4 h-4 shrink-0' />
            <span className='font-medium'>Private</span>
            {visibility === 'PRIVATE' && <span className='ml-auto'>✓</span>}
          </div>
          <p className='text-muted-foreground text-xs pl-6 text-left'>
            {getVisibilityDescription('PRIVATE')}
          </p>
        </DropdownMenuItem>
        <DropdownMenuItem
          className='flex flex-col items-start gap-0.5 py-3'
          onClick={() => handleVisibilityChange('WORKSPACE' as Visibility)}
        >
          <div className='flex w-full items-center gap-2'>
            <Users className='w-4 h-4 shrink-0' />
            <span className='font-medium'>Workspace</span>
            {visibility === 'WORKSPACE' && <span className='ml-auto'>✓</span>}
          </div>
          <p className='text-muted-foreground text-xs pl-6 text-left'>
            {getVisibilityDescription('WORKSPACE', workspaceName)}
          </p>
        </DropdownMenuItem>
        <DropdownMenuItem
          className='flex flex-col items-start gap-0.5 py-3'
          onClick={() => handleVisibilityChange('PUBLIC' as Visibility)}
        >
          <div className='flex w-full items-center gap-2'>
            <EyeIcon className='w-4 h-4 shrink-0' />
            <span className='font-medium'>Public</span>
            {visibility === 'PUBLIC' && <span className='ml-auto'>✓</span>}
          </div>
          <p className='text-muted-foreground text-xs pl-6 text-left'>
            {getVisibilityDescription('PUBLIC')}
          </p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
