'use client';

import { useState } from 'react';
import { Filter, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function FilterMenu() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          title="Filter cards"
        >
          <Filter className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 border-accent">
        <DropdownMenuLabel>Filter cards</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Users className="w-4 h-4 mr-2" />
          <span>Filter by members</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Tag className="w-4 h-4 mr-2" />
          <span>Filter by labels</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="w-4 h-4 mr-2">📅</span>
          <span>Filter by due date</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <span>Clear all filters</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
