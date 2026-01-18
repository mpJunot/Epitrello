"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { getMyWorkspaces, createWorkspace } from "@/lib/actions/workspaces";

type Board = { id: string; title: string; color?: string };
type Workspace = { id: string; name: string; };

const STORAGE_KEY = "epitrello_boards";
const ACTIVE_KEY = "epitrello_active_board";
const EXPANDED_KEY = "epitrello_expanded_workspaces";

function loadBoards(): Board[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Board[];
  } catch {
    return [];
  }
}

function saveBoards(boards: Board[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  window.dispatchEvent(new Event("epitrello:boards-updated"));
}

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
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
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
  

  if (pathname && pathname.startsWith("/auth")) return null;

  useEffect(() => {
    // set active board from storage or url
    try {
      const active = localStorage.getItem(ACTIVE_KEY);
      if (active) setActiveId(active);

      // Check if we're on a board page
      if (pathname && pathname.startsWith('/boards/')) {
        const boardId = pathname.split('/boards/')[1];
        if (boardId) {
          setActiveId(boardId);
          localStorage.setItem(ACTIVE_KEY, boardId);
        }
      }

      const params = new URLSearchParams(window.location.search);
      const q = params.get("board");
      if (q) {
        setActiveId(q);
        localStorage.setItem(ACTIVE_KEY, q);
      }
    } catch {}
  }, []);

  // load workspaces from backend and expanded state
  useEffect(() => {
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
  }, []);

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

  // persist expandedWorkspaces to storage when it changes
  useEffect(() => {
    saveExpanded(expandedWorkspaces);
  }, [expandedWorkspaces]);

  const openBoard = (id: string) => {
    try {
      localStorage.setItem(ACTIVE_KEY, id);
      setActiveId(id);
    } catch {}
    router.push(`/boards/${id}`);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const workspaceName = newWorkspaceName.trim();
    if (!workspaceName) return;

    setCreatingWorkspace(true);
    try {
      // Call backend to create workspace
      const newWorkspace = await createWorkspace({ name: workspaceName });
      
      // Add new workspace to list
      setWorkspaces([...workspaces, newWorkspace]);
      
      // Show success message
      setFeedback(`Workspace "${newWorkspace.name}" créé avec succès`);
      
      // Close modal and reset form
      setShowCreateWorkspaceModal(false);
      setNewWorkspaceName('');
      
      // Clear feedback after 3 seconds
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

  const onSignOut = async () => {
    // Client-only logout: clear local storage and redirect
    try {
      localStorage.removeItem('epitrello_user');
      localStorage.removeItem('epitrello_notifications');
      localStorage.removeItem('epitrello_boards');
      localStorage.removeItem('epitrello_active_board');
      localStorage.removeItem('epitrello_expanded_workspaces');
      localStorage.removeItem('auth_token');
    } catch (e) {}
    router.push("/auth/login");
  };

  

  

  // adapt initial collapsed on small screens
  useEffect(() => {
    try {
      if (window.innerWidth < 640) setCollapsed(true);
    } catch {}
  }, []);

  return (
    <aside
      className={`transition-all duration-150 bg-white border-r ${collapsed ? "w-20" : "w-64"} h-screen flex flex-col shrink-0`}
      aria-label="Barre latérale principale"
    >
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-indigo-600 text-white flex items-center justify-center font-bold">E</div>
          {!collapsed && <h3 className="text-sm font-semibold text-gray-900">Epitrello</h3>}
        </div>
        <div>
          <button
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed((c) => !c)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-auto">
        {!collapsed && (
          <div className="mb-3">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push("/dashboard")}
                  className={`w-full flex items-center gap-3 p-2 rounded text-sm ${
                    (pathname === "/" || pathname === "/dashboard") ? "bg-indigo-50 font-semibold text-gray-900" : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M10 2L2 8v8a1 1 0 001 1h4v-6h6v6h4a1 1 0 001-1V8l-8-6z" />
                  </svg>
                  <span>Home</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => (activeId ? router.push(`/boards/${activeId}`) : router.push('/dashboard'))}
                  className={`w-full flex items-center gap-3 p-2 rounded text-sm ${
                    pathname?.startsWith("/boards/") ? "bg-indigo-50 font-semibold text-gray-900" : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M3 3h6v6H3V3zM11 3h6v3h-6V3zM11 8h6v9h-6V8zM3 11h6v1H3v-1z" />
                  </svg>
                  <span>Boards</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        <nav>
          {/* Workspaces section */}
          {!collapsed && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 uppercase mb-2">Workspaces</div>
              
              {/* Loading state */}
              {loadingWorkspaces && (
                <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
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
                  <button 
                    onClick={retryLoadWorkspaces}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {/* Empty state */}
              {!loadingWorkspaces && !workspacesError && workspaces.length === 0 && (
                <div className="space-y-2">
                  <p className="p-2 text-sm text-gray-500 text-center">Aucun workspace</p>
                  <button
                    onClick={() => setShowCreateWorkspaceModal(true)}
                    className="w-full p-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center justify-center gap-2 font-medium"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Créer un workspace
                  </button>
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
                          <button onClick={() => toggleWorkspace(w.id)} className="w-full text-left p-2 rounded flex items-center gap-2 hover:bg-gray-50">
                            <span className="font-medium text-gray-900">{w.name}</span>
                            <span className="ml-auto text-gray-400">{expanded ? "▾" : "▸"}</span>
                          </button>
                        </div>

                        {expanded && (
                          <div className="mt-1 ml-4">
                            <ul className="space-y-1">
                              <li>
                                <button onClick={() => onBoards(w.id)} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded ${boardsActive ? "bg-indigo-50 font-semibold text-gray-900" : "text-gray-800 hover:bg-gray-50"}`}>
                                  <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                    <path d="M3 3h6v6H3V3zM11 3h6v3h-6V3zM11 8h6v9h-6V8zM3 11h6v1H3v-1z" />
                                  </svg>
                                  <span>Boards</span>
                                </button>
                              </li>

                              <li>
                                <button onClick={() => onMembers(w.id)} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded ${membersActive ? "bg-indigo-50 font-semibold text-gray-900" : "text-gray-800 hover:bg-gray-50"}`}>
                                  <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                    <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM4 14a4 4 0 018 0v1H4v-1z" />
                                  </svg>
                                  <span>Members</span>
                                </button>
                              </li>

                              <li>
                                <button onClick={() => onSettings(w.id)} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded ${settingsActive ? "bg-indigo-50 font-semibold text-gray-900" : "text-gray-800 hover:bg-gray-50"}`}>
                                  <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                    <path fillRule="evenodd" d="M11.3 1.046a1 1 0 00-2.6 0l-.2.6a1 1 0 01-.95.69H5.1a1 1 0 00-.98.8l-.2.98a1 1 0 01-.54.72L2.1 6.9a1 1 0 000 1.2l1 1a1 1 0 01.27.9l-.2.98a1 1 0 00.98 1.2h2.55a1 1 0 01.95.69l.2.6a1 1 0 002.6 0l.2-.6a1 1 0 01.95-.69h2.55a1 1 0 00.98-1.2l-.2-.98a1 1 0 01.27-.9l1-1a1 1 0 000-1.2l-1.36-1.36a1 1 0 01-.54-.72l-.2-.98a1 1 0 00-.98-.8h-2.55a1 1 0 01-.95-.69l-.2-.6z" clipRule="evenodd" />
                                  </svg>
                                  <span>Settings</span>
                                </button>
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
          <div className="text-xs text-gray-500">Your workspace • <a href="/auth/me" className="text-indigo-600">Profile</a></div>
        ) : (
          <div className="text-xs text-gray-500 text-center">E</div>
        )}
      </div>

      {/* Feedback live region for accessibility */}
      <div aria-live="polite" className="sr-only">
        {feedback}
      </div>

      {/* Create Workspace Modal */}
      {showCreateWorkspaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Créer un nouveau workspace</h2>
            
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du workspace
                </label>
                <input
                  id="workspace-name"
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Ex: Mon équipe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  disabled={creatingWorkspace}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateWorkspaceModal(false);
                    setNewWorkspaceName('');
                  }}
                  disabled={creatingWorkspace}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingWorkspace || !newWorkspaceName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {creatingWorkspace && (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  )}
                  {creatingWorkspace ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
