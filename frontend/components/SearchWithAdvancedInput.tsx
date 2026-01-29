/**
 * Advanced Search Component
 * Uses shadcn/ui Command with built-in filtering
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mapBoardsToSearchResults, mapWorkspacesToSearchResults } from '@/lib/utils/search-mapper';
import { getWorkspaceBoards, type GqlBoard } from '@/lib/actions/workspaces';
import type { SearchResult } from '@/lib/types/search';
import type { Workspace } from '@/lib/graphql-types';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

/**
 * Search component with Command built-in filtering
 */
export function SearchWithAdvancedInput() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [boards, setBoards] = useState<SearchResult[]>([]);
  const [workspaces, setWorkspaces] = useState<SearchResult[]>([]);

  /**
   * Load data from localStorage and backend on mount
   */
  useEffect(() => {
    console.log('[SearchWithAdvancedInput] ✅ Component mounted, loading data...');

    const loadData = async () => {
      try {
        const cachedWorkspaces = localStorage.getItem('epitrello_workspaces');
        console.log('[SearchWithAdvancedInput] 📦 Cached workspaces:', cachedWorkspaces);

        if (!cachedWorkspaces) {
          console.log('[SearchWithAdvancedInput] ⚠️ No cached workspaces found');
          return;
        }

        // Load workspaces from cache
        const workspacesData: Workspace[] = JSON.parse(cachedWorkspaces);
        console.log('[SearchWithAdvancedInput] ✅ Parsed workspaces:', {
          count: workspacesData.length,
          ids: workspacesData.map(w => w.id),
          titles: workspacesData.map(w => w.name),
          firstWorkspace: workspacesData[0],
        });

        const workspaceResults = mapWorkspacesToSearchResults(workspacesData);
        console.log('[SearchWithAdvancedInput] ✅ Mapped workspaces to SearchResult:', {
          count: workspaceResults.length,
          results: workspaceResults.map(w => ({
            id: w.id,
            title: w.title,
            subtitle: w.subtitle,
            route: w.route,
          })),
        });
        setWorkspaces(workspaceResults);
        console.log('[SearchWithAdvancedInput] ✅ Workspaces state updated, count:', workspaceResults.length);

        // Fetch boards for each workspace from backend
        console.log('[SearchWithAdvancedInput] 🌐 Fetching boards from backend...');
        const allBoards: GqlBoard[] = [];

        for (const workspace of workspacesData) {
          try {
            console.log(`[SearchWithAdvancedInput] 🔄 Fetching boards for workspace: ${workspace.name} (${workspace.id})`);
            
            const boards = await getWorkspaceBoards(workspace.id);

            if (boards && boards.length > 0) {
              console.log(`[SearchWithAdvancedInput] ✅ Fetched ${boards.length} boards for ${workspace.name}`);
              allBoards.push(...boards);
            } else {
              console.log(`[SearchWithAdvancedInput] ⚠️ No boards found for ${workspace.name}`);
            }
          } catch (error) {
            console.error(`[SearchWithAdvancedInput] ❌ Failed to fetch boards for workspace ${workspace.id}:`, error);
          }
        }

        console.log('[SearchWithAdvancedInput] ✅ Total boards fetched:', {
          count: allBoards.length,
          titles: allBoards.map(b => b.title),
        });

        // Map boards to SearchResult
        if (allBoards.length > 0) {
          const boardResults = mapBoardsToSearchResults(allBoards);
          console.log('[SearchWithAdvancedInput] ✅ Mapped boards to SearchResult:', {
            count: boardResults.length,
            searchValues: boardResults.map(b => `"${b.title} ${b.subtitle || ''}"`),
          });
          setBoards(boardResults);
        } else {
          console.log('[SearchWithAdvancedInput] ⚠️ No boards to display');
        }
      } catch (error) {
        console.error('[SearchWithAdvancedInput] ❌ Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  /**
   * Handle navigation to selected result
   */
  const handleSelect = (result: SearchResult) => {
    console.log('[SearchWithAdvancedInput] ✅ Item selected:', {
      id: result.id,
      type: result.type,
      title: result.title,
      route: result.route,
    });
    setOpen(false);
    console.log('[SearchWithAdvancedInput] 🚀 Navigating to:', result.route);
    router.push(result.route);
  };

  return (
    <div className="hidden lg:flex items-center gap-2 ml-4 min-w-0 flex-1 max-w-md">
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Search boards, workspaces..."
          onFocus={() => {
            console.log('[SearchWithAdvancedInput] 👁️ Input focused');
            console.log('[SearchWithAdvancedInput] 📊 Current state:', {
              boardsCount: boards.length,
              workspacesCount: workspaces.length,
              boardTitles: boards.map(b => b.title),
              workspaceTitles: workspaces.map(w => w.title),
            });
            setOpen(true);
          }}
          onBlur={() => {
            console.log('[SearchWithAdvancedInput] 👁️ Input blurred, closing dropdown in 200ms');
            setTimeout(() => setOpen(false), 200);
          }}
        />
        {open && (
          <CommandList className="max-h-[400px] overflow-y-auto">
            <CommandEmpty>
              <div className="text-sm text-muted-foreground mb-2">
                Aucun résultat trouvé
              </div>
              <div className="text-xs text-muted-foreground/60">
                Essayez une autre requête de recherche
              </div>
            </CommandEmpty>

            {boards.length > 0 && (
              <CommandGroup heading={`Boards (${boards.length})`}>
                {boards.map((board) => (
                  <CommandItem
                    key={board.id}
                    value={`${board.title} ${board.subtitle || ''}`}
                    onSelect={() => {
                      console.log('[SearchWithAdvancedInput] 🎯 Board item selected (CommandItem.onSelect):', {
                        title: board.title,
                        searchValue: `${board.title} ${board.subtitle || ''}`,
                      });
                      handleSelect(board);
                    }}
                  >
                    {board.avatar && (
                      <div
                        className={`w-8 h-8 rounded flex-shrink-0 mr-3 ${board.avatar}`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {board.title}
                      </div>
                      {board.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          {board.subtitle}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {workspaces.length > 0 && (
              <CommandGroup heading={`Workspaces (${workspaces.length})`}>
                {workspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    value={`${workspace.title} ${workspace.subtitle || ''}`}
                    onSelect={() => {
                      console.log('[SearchWithAdvancedInput] 🎯 Workspace item selected (CommandItem.onSelect):', {
                        title: workspace.title,
                        searchValue: `${workspace.title} ${workspace.subtitle || ''}`,
                      });
                      handleSelect(workspace);
                    }}
                  >
                    {workspace.avatar && (
                      <div
                        className={`w-8 h-8 rounded flex-shrink-0 mr-3 ${workspace.avatar}`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {workspace.title}
                      </div>
                      {workspace.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          {workspace.subtitle}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
}
