"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMyWorkspaces, createWorkspace } from "@/lib/actions/workspaces";
import { getAuthToken } from "@/lib/graphql-client";
import { Home, Plus, LayoutGrid, Users, Settings, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Workspace = { id: string; name: string; };

const ACTIVE_KEY = "epitrello_active_board";
const EXPANDED_KEY = "epitrello_expanded_workspaces";

function loadExpanded(): string[] {
  try {
    const raw = localStorage.getItem(EXPANDED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveExpanded(ids: string[]) {
  localStorage.setItem(EXPANDED_KEY, JSON.stringify(ids));
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [workspacesError, setWorkspacesError] = useState<string | null>(null);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");


  useEffect(() => {
    try {
      if (pathname && pathname.startsWith('/boards/')) {
        const boardId = pathname.split('/boards/')[1];
        if (boardId) {
          localStorage.setItem(ACTIVE_KEY, boardId);
        }
      }

      const params = new URLSearchParams(window.location.search);
      const q = params.get("board");
      if (q) {
        localStorage.setItem(ACTIVE_KEY, q);
      }
    } catch {}
  }, [pathname]);

  useEffect(() => {
    if (isAuthPage) {
      setLoadingWorkspaces(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setLoadingWorkspaces(false);
      setWorkspaces([]);
      return;
    }

    const loadWorkspacesFromBackend = async () => {
      setLoadingWorkspaces(true);
      setWorkspacesError(null);
      try {
        const ws = await getMyWorkspaces();
        setWorkspaces(ws);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load workspaces';
        setWorkspacesError(errorMessage);
        setWorkspaces([]);
      } finally {
        setLoadingWorkspaces(false);
      }
    };

    loadWorkspacesFromBackend();
    setExpandedWorkspaces(loadExpanded());
  }, [isAuthPage]);

  const retryLoadWorkspaces = async () => {
    setLoadingWorkspaces(true);
    setWorkspacesError(null);
    try {
      const ws = await getMyWorkspaces();
      setWorkspaces(ws);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load workspaces';
      setWorkspacesError(errorMessage);
      setWorkspaces([]);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    saveExpanded(expandedWorkspaces);
  }, [expandedWorkspaces]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const workspaceName = newWorkspaceName.trim();
    if (!workspaceName) return;

    setCreatingWorkspace(true);
    try {
      const newWorkspace = await createWorkspace({ name: workspaceName });

      setWorkspaces([...workspaces, newWorkspace]);

      setFeedback(`Workspace "${newWorkspace.name}" créé avec succès`);

      setShowCreateWorkspaceModal(false);
      setNewWorkspaceName('');

      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création';
      setFeedback(errorMessage);
    } finally {
      setCreatingWorkspace(false);
    }
  };



  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      saveExpanded(next);
      return next;
    });
  };

  const onBoards = (wid: string) => {
    router.push(`/workspaces/${wid}/boards`);
  };

  const onMembers = (wid: string) => {
    router.push(`/workspaces/${wid}/members`);
  };

  const onSettings = (wid: string) => {
    router.push(`/workspaces/${wid}/settings`);
  };

  // adapt initial collapsed on small screens
  useEffect(() => {
    try {
      if (window.innerWidth < 640) setCollapsed(true);
    } catch {}
  }, []);

  if (isAuthPage) {
    return null;
  }

  return (
    <aside
      className={`transition-all duration-150 bg-white border-r border-trello ${collapsed ? "w-20" : "w-64"} h-screen flex flex-col shrink-0`}
      aria-label="Main sidebar"
    >
      <div className="flex items-center justify-between p-3 border-b border-trello">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-trello-blue text-white flex items-center justify-center font-bold">E</div>
          {!collapsed && <h3 className="text-sm font-semibold text-trello">Epitrello</h3>}
        </div>
        <div>
          <Button
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed((c) => !c)}
            variant="ghost"
            size="icon"
          >
            {collapsed ? "→" : "←"}
          </Button>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-auto">
        {!collapsed && (
          <div className="mb-3">
            <ul className="space-y-2">
              <li>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant={pathname === "/" || pathname === "/dashboard" ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    (pathname === "/" || pathname === "/dashboard") ? "bg-trello-blue-light font-semibold text-trello" : ""
                  }`}
                >
                  <Home className="h-4 w-4 text-trello-secondary" aria-hidden="true" />
                  <span>Home</span>
                </Button>
              </li>
            </ul>
          </div>
        )}

        <nav>
          {/* Workspaces section */}
          {!collapsed && (
            <div className="mb-3">
              <div className="text-xs text-trello-secondary uppercase mb-2">Workspaces</div>

              {/* Add workspace button */}
              <div className="mb-2">
                <Button
                  onClick={() => setShowCreateWorkspaceModal(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add workspace
                </Button>
              </div>

              {/* Loading state */}
              {loadingWorkspaces && (
                <div className="flex items-center gap-2 p-2 text-sm text-trello-secondary">
                  <div className="animate-spin h-4 w-4 border-2 border-trello border-t-trello rounded-full"></div>
                  <span>Loading...</span>
                </div>
              )}

              {/* Error state */}
              {workspacesError && !loadingWorkspaces && (
                <div className="p-2 text-sm text-red-600 bg-red-50 rounded space-y-2">
                  <div>
                    <p className="font-medium">Failed to load workspaces</p>
                    <p className="text-xs mt-1">{workspacesError}</p>
                  </div>
                  <Button
                    onClick={retryLoadWorkspaces}
                    variant="destructive"
                    size="sm"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Empty state */}
              {!loadingWorkspaces && !workspacesError && workspaces.length === 0 && (
                <div className="space-y-2">
                  <p className="p-2 text-sm text-trello-secondary text-center">No workspace</p>
                </div>
              )}

              {/* Workspaces list */}
              {!loadingWorkspaces && !workspacesError && workspaces.length > 0 && (
                <ul className="space-y-2">
                  {workspaces.map((w) => {
                    const expanded = expandedWorkspaces.includes(w.id);
                    // derive active states for items inside this workspace
                    const boardsActive = !!pathname && pathname.startsWith(`/workspaces/${w.id}/boards`);
                    const membersActive = !!pathname && pathname.startsWith(`/workspaces/${w.id}/members`);
                    const settingsActive = !!pathname && pathname.startsWith(`/workspaces/${w.id}/settings`);
                    return (
                      <li key={w.id}>
                        <div className="flex items-center justify-between">
                          <Button onClick={() => toggleWorkspace(w.id)} variant="ghost" className="w-full justify-start">
                            <span className="font-medium text-trello">{w.name}</span>
                            {expanded ? (
                              <ChevronDown className="ml-auto h-4 w-4 text-trello-secondary" />
                            ) : (
                              <ChevronRight className="ml-auto h-4 w-4 text-trello-secondary" />
                            )}
                          </Button>
                        </div>

                        {expanded && (
                          <div className="mt-1 ml-4">
                            <ul className="space-y-1">
                              <li>
                                <Button onClick={() => onBoards(w.id)} variant={boardsActive ? "default" : "ghost"} className={`w-full justify-start ${boardsActive ? "bg-trello-blue-light font-semibold text-trello" : ""}`}>
                                  <LayoutGrid className="h-4 w-4 text-trello-secondary" aria-hidden="true" />
                                  <span>Boards</span>
                                </Button>
                              </li>

                              <li>
                                <Button onClick={() => onMembers(w.id)} variant={membersActive ? "default" : "ghost"} className={`w-full justify-start ${membersActive ? "bg-trello-blue-light font-semibold text-trello" : ""}`}>
                                  <Users className="h-4 w-4 text-trello-secondary" aria-hidden="true" />
                                  <span>Members</span>
                                </Button>
                              </li>

                              <li>
                                <Button onClick={() => onSettings(w.id)} variant={settingsActive ? "default" : "ghost"} className={`w-full justify-start ${settingsActive ? "bg-trello-blue-light font-semibold text-trello" : ""}`}>
                                  <Settings className="h-4 w-4 text-trello-secondary" aria-hidden="true" />
                                  <span>Settings</span>
                                </Button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

        </nav>
      </div>

      <div className="p-3 border-t">
        {!collapsed ? (
          <div className="text-xs text-trello-secondary">Your workspace • <a href="/auth/me" className="text-trello-blue">Profile</a></div>
        ) : (
          <div className="text-xs text-trello-secondary text-center">E</div>
        )}
      </div>

      {/* Feedback live region for accessibility */}
      <div aria-live="polite" className="sr-only">
        {feedback}
      </div>

      {/* Create Workspace Modal */}
      <Dialog open={showCreateWorkspaceModal} onOpenChange={setShowCreateWorkspaceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your boards
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input
                id="workspace-name"
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Ex: My team"
                disabled={creatingWorkspace}
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateWorkspaceModal(false);
                  setNewWorkspaceName('');
                }}
                disabled={creatingWorkspace}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creatingWorkspace || !newWorkspaceName.trim()}
              >
                {creatingWorkspace && (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                )}
                {creatingWorkspace ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
