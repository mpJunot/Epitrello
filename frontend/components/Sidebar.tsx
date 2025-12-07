"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

type Board = { id: string; title: string; color?: string };

const STORAGE_KEY = "epitrello_boards";
const ACTIVE_KEY = "epitrello_active_board";

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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  if (pathname && pathname.startsWith("/auth")) return null;

  useEffect(() => {
    let loaded = [] as Board[];
    try {
      loaded = loadBoards();
    } catch {}
    if (!loaded || loaded.length === 0) {
      loaded = [
        { id: uuidv4(), title: "Personal", color: "bg-sky-500" },
        { id: uuidv4(), title: "Work", color: "bg-emerald-500" },
        { id: uuidv4(), title: "Side project", color: "bg-indigo-500" },
      ];
      saveBoards(loaded);
    }
    setBoards(loaded);

    const onUpdate = () => setBoards(loadBoards());
    window.addEventListener("epitrello:boards-updated", onUpdate);
    return () => window.removeEventListener("epitrello:boards-updated", onUpdate);
  }, []);

  const openBoard = (id: string) => {
    try {
      localStorage.setItem(ACTIVE_KEY, id);
    } catch {}
    router.push(`/dashboard?board=${id}`);
  };

  const createBoard = () => {
    if (!newName.trim()) return;
    const b: Board = { id: uuidv4(), title: newName.trim(), color: "bg-indigo-400" };
    const next = [b, ...boards];
    saveBoards(next);
    setBoards(next);
    setNewName("");
    setCreating(false);
    openBoard(b.id);
  };

  const removeBoard = (id: string) => {
    const next = boards.filter((b) => b.id !== id);
    saveBoards(next);
    setBoards(next);
    const active = localStorage.getItem(ACTIVE_KEY);
    if (active === id) {
      localStorage.removeItem(ACTIVE_KEY);
      if (next[0]) openBoard(next[0].id);
      else router.push("/");
    }
  };

  return (
    <aside className={`transition-all duration-150 bg-white border-r ${collapsed ? "w-20" : "w-64"} h-screen flex flex-col`}>
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-indigo-600 text-white flex items-center justify-center font-bold">E</div>
          {!collapsed && <h3 className="text-sm font-semibold">Epitrello</h3>}
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
            <button
              onClick={() => setCreating((s) => !s)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 text-white px-3 py-2 text-sm"
            >
              + Créer un tableau
            </button>
            {creating && (
              <div className="mt-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nom du tableau"
                  className="w-full rounded border p-2 text-sm"
                />
                <div className="mt-2 flex gap-2">
                  <button onClick={createBoard} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Créer</button>
                  <button onClick={() => setCreating(false)} className="px-3 py-1 bg-gray-100 rounded text-sm">Annuler</button>
                </div>
              </div>
            )}
          </div>
        )}

        <nav>
          <div className="text-xs text-gray-500 uppercase mb-2">Tableaux</div>
          <ul className="space-y-2">
            {boards.map((b) => (
              <li key={b.id} className="flex items-center justify-between">
                <button
                  onClick={() => openBoard(b.id)}
                  className="flex items-center gap-3 w-full text-left p-2 rounded hover:bg-gray-50"
                >
                  <div className={`${b.color || "bg-gray-300"} h-3 w-3 rounded-sm`} />
                  {!collapsed && <span className="truncate">{b.title}</span>}
                </button>
                {!collapsed && (
                  <button onClick={() => removeBoard(b.id)} className="text-xs text-red-500 px-2">Suppr</button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="p-3 border-t">
        {!collapsed ? (
          <div className="text-xs text-gray-500">Votre espace • <a href="/auth/me" className="text-indigo-600">Profil</a></div>
        ) : (
          <div className="text-xs text-gray-500 text-center">E</div>
        )}
      </div>
    </aside>
  );
}
