'use client';

import { Volume2, Image as ImageIcon, MoreHorizontal, Copy, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CardModalHeaderProps {
  onCopyCard: () => void;
  onRequestArchive: () => void;
  onRequestDelete: () => void;
}

export function CardModalHeader({
  onCopyCard,
  onRequestArchive,
  onRequestDelete,
}: CardModalHeaderProps) {
  return (
    <div className="border-b border-accent shrink-0" >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-trello-secondary hover:bg-trello-hover">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-trello-secondary hover:bg-trello-hover">
            <ImageIcon className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-trello-secondary hover:bg-trello-hover">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-accent">
              <DropdownMenuItem onClick={onCopyCard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-accent" />
              <DropdownMenuItem onClick={onRequestArchive}>
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRequestDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
