/**
 * Advanced Search Component
 * Uses shadcn/ui Command with built-in filtering
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  mapBoardsToSearchResults,
  mapWorkspacesToSearchResults,
} from '@/lib/utils/search-mapper';
import {
  getMyWorkspaces,
  getWorkspaceBoards,
  type GqlBoard,
} from '@/lib/actions/workspaces';
import type { SearchResult } from '@/lib/types/search';
import { LayoutDashboard, Building2 } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandSeparator,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export interface SearchWithAdvancedInputProps {
  onClose?: () => void;
}

/**
 * Search component with Command built-in filtering (for use inside a Dialog).
 */
export function SearchWithAdvancedInput({
  onClose,
}: SearchWithAdvancedInputProps = {}) {
  const router = useRouter();
  const [boards, setBoards] = useState<SearchResult[]>([]);
  const [workspaces, setWorkspaces] = useState<SearchResult[]>([]);

  /**
   * Load workspaces from API (only workspaces the user is a member of),
   * then fetch boards for each to avoid "You are not a member of this workspace" errors.
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        const workspacesData = await getMyWorkspaces();
        if (!workspacesData?.length) {
          setWorkspaces([]);
          setBoards([]);
          return;
        }

        const workspaceResults = mapWorkspacesToSearchResults(workspacesData);
        setWorkspaces(workspaceResults);

        const allBoards: GqlBoard[] = [];
        for (const workspace of workspacesData) {
          try {
            const boards = await getWorkspaceBoards(workspace.id);
            if (boards?.length) {
              allBoards.push(...boards);
            }
          } catch {
            continue;
          }
        }

        if (allBoards.length > 0) {
          setBoards(mapBoardsToSearchResults(allBoards));
        }
      } catch {
        setWorkspaces([]);
        setBoards([]);
      }
    };

    loadData();
  }, []);

  /**
   * Handle navigation to selected result
   */
  const handleSelect = (result: SearchResult) => {
    router.push(result.route);
    onClose?.();
  };

  return (
    <Command className='w-full rounded-lg bg-card'>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList className='flex-1 min-h-0 overflow-y-auto'>
        <CommandEmpty>
          <div className='text-sm text-muted-foreground mb-2'>
            No results found
          </div>
          <div className='text-xs text-muted-foreground/60'>
            Try a different search query
          </div>
        </CommandEmpty>

        {boards.length > 0 && (
          <CommandGroup heading='Boards'>
            {boards.map((board) => (
              <CommandItem
                key={board.id}
                value={`${board.title} ${board.subtitle || ''}`}
                onSelect={() => handleSelect(board)}
                className='flex items-center gap-2'
              >
                <LayoutDashboard className='size-5 shrink-0 text-muted-foreground' />
                <div className='flex-1 min-w-0'>
                  <div className='font-medium text-sm truncate'>
                    {board.title}
                  </div>
                  {board.subtitle && (
                    <div className='text-xs text-muted-foreground truncate'>
                      {board.subtitle}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {boards.length > 0 && workspaces.length > 0 && (
          <CommandSeparator className='bg-accent' />
        )}

        {workspaces.length > 0 && (
          <CommandGroup heading='Workspaces'>
            {workspaces.map((workspace) => (
              <CommandItem
                key={workspace.id}
                value={`${workspace.title} ${workspace.subtitle || ''}`}
                onSelect={() => handleSelect(workspace)}
                className='flex items-center gap-2'
              >
                <Building2 className='size-5 shrink-0 text-muted-foreground' />
                <div className='flex-1 min-w-0'>
                  <div className='font-medium text-sm truncate'>
                    {workspace.title}
                  </div>
                  {workspace.subtitle && (
                    <div className='text-xs text-muted-foreground truncate'>
                      {workspace.subtitle}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
