"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMyWorkspaces, createWorkspace } from "@/lib/actions/workspaces";
import { getAuthToken } from "@/lib/graphql-client";
import { Home, Plus, LayoutGrid, Users, Settings, ChevronDown } from "lucide-react";
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

export default function AppSidebar() {
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

  const loadWorkspaces = async () => {
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

    loadWorkspaces();
    setExpandedWorkspaces(loadExpanded());
  }, [isAuthPage]);

  const retryLoadWorkspaces = async () => {
    await loadWorkspaces();
  };

  useEffect(() => {
    const handleWorkspaceChange = () => {
      if (!isAuthPage) {
        loadWorkspaces();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'epitrello_workspaces') {
        handleWorkspaceChange();
      }
    };

    window.addEventListener('epitrello:workspaces:changed', handleWorkspaceChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('epitrello:workspaces:changed', handleWorkspaceChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [isAuthPage]);

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

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">E</div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-sidebar-foreground">Epitrello</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => router.push("/dashboard")}
                    isActive={pathname === "/" || pathname === "/dashboard"}
                    tooltip="Home"
                  >
                    <Home />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setShowCreateWorkspaceModal(true)}
                    tooltip="Add workspace"
                  >
                    <Plus />
                    <span>Add workspace</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {loadingWorkspaces && (
                  <SidebarMenuItem>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-sidebar-foreground/70">
                      <div className="animate-spin h-4 w-4 border-2 border-sidebar-foreground/30 border-t-sidebar-foreground rounded-full"></div>
                      <span>Loading...</span>
                    </div>
                  </SidebarMenuItem>
                )}

                {workspacesError && !loadingWorkspaces && (
                  <SidebarMenuItem>
                    <div className="px-2 py-1.5 text-sm text-red-600 bg-red-50 rounded space-y-2">
                      <div>
                        <p className="font-medium">Failed to load workspaces</p>
                        <p className="text-xs mt-1">{workspacesError}</p>
                      </div>
                      <Button
                        onClick={retryLoadWorkspaces}
                        variant="destructive"
                        size="sm"
                        className="w-full"
                      >
                        Retry
                      </Button>
                    </div>
                  </SidebarMenuItem>
                )}

                {!loadingWorkspaces && !workspacesError && workspaces.length === 0 && (
                  <SidebarMenuItem>
                    <div className="px-2 py-1.5 text-sm text-sidebar-foreground/70 text-center">
                      No workspace
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {!loadingWorkspaces && !workspacesError && workspaces.map((w) => {
            const expanded = expandedWorkspaces.includes(w.id);
            const boardsActive = !!pathname && pathname.startsWith(`/workspaces/${w.id}/boards`);
            const membersActive = !!pathname && pathname.startsWith(`/workspaces/${w.id}/members`);
            const settingsActive = !!pathname && pathname.startsWith(`/workspaces/${w.id}/settings`);

            return (
              <Collapsible
                key={w.id}
                defaultOpen={expanded}
                onOpenChange={(open) => {
                  if (open !== expanded) {
                    toggleWorkspace(w.id);
                  }
                }}
                className="group/collapsible"
              >
                <SidebarGroup>
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={w.name}>
                        <span className="font-medium">{w.name}</span>
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => onBoards(w.id)}
                            isActive={boardsActive}
                            tooltip="Boards"
                          >
                            <LayoutGrid />
                            <span>Boards</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => onMembers(w.id)}
                            isActive={membersActive}
                            tooltip="Members"
                          >
                            <Users />
                            <span>Members</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => onSettings(w.id)}
                            isActive={settingsActive}
                            tooltip="Settings"
                          >
                            <Settings />
                            <span>Settings</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          })}
        </SidebarContent>

        <SidebarFooter>
          <div className="px-2 py-1.5 text-xs text-sidebar-foreground/70">
            <div className="group-data-[collapsible=icon]:hidden">
              Your workspace • <a href="/auth/me" className="text-primary hover:underline">Profile</a>
            </div>
            <div className="group-data-[collapsible=icon]:block hidden text-center">E</div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

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
    </>
  );
}
