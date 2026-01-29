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
import { Visibility } from '@/lib/graphql-types';

interface VisibilityDropdownProps {
  visibility: Visibility;
  onVisibilityChange?: (visibility: Visibility) => void;
}

export function VisibilityDropdown({ visibility, onVisibilityChange }: VisibilityDropdownProps) {
  const handleVisibilityChange = (newVisibility: Visibility) => {
    if (onVisibilityChange) {
      onVisibilityChange(newVisibility);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 h-auto px-2 py-1"
        >
          {getVisibilityIcon(visibility)}
          <span className="ml-1 text-sm">{getVisibilityLabel(visibility)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="border-accent">
        <DropdownMenuLabel>Change visibility</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleVisibilityChange('PRIVATE' as Visibility)}>
          <Eye className="w-4 h-4 mr-2" />
          <span>Private</span>
          {visibility === 'PRIVATE' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleVisibilityChange('WORKSPACE' as Visibility)}>
          <Users className="w-4 h-4 mr-2" />
          <span>Workspace</span>
          {visibility === 'WORKSPACE' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleVisibilityChange('PUBLIC' as Visibility)}>
          <EyeIcon className="w-4 h-4 mr-2" />
          <span>Public</span>
          {visibility === 'PUBLIC' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
