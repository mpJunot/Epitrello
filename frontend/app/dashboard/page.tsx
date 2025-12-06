"use client"
import React, { useState } from "react"
import Link from "next/link"

type Board = {
  id: string
  name: string
  color?: string
  members?: number
}

const initialBoards: Board[] = [
  { id: "1", name: "Projet Alpha", color: "bg-amber-400", members: 3 },
  { id: "2", name: "Sprint Q4", color: "bg-sky-400", members: 5 },
  { id: "3", name: "Backlog Produit", color: "bg-emerald-400", members: 2 },
]

export default function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>(initialBoards)

  const createBoard = () => {
    const newBoard: Board = {
      id: String(Date.now()),
      name: "Nouvelle planche",
      color: "bg-violet-400",
      members: 1,
    }
    setBoards((b) => [newBoard, ...b])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded bg-indigo-600 flex items-center justify-center text-white font-bold">E</div>
          <h1 className="text-2xl font-semibold">Epitrello — Tableaux</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={createBoard}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700"
          >
            Créer un tableau
          </button>
        </div>
      </header>

      <main>
        <section>
          <h2 className="text-lg font-medium mb-4">Vos tableaux</h2>
          {boards.length === 0 ? (
            <div className="text-sm text-gray-500">Vous n'avez pas encore de tableaux. Créez-en un pour commencer.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="block p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded ${board.color} flex items-center justify-center text-white font-semibold`}> 
                        {board.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{board.name}</div>
                        <div className="text-xs text-gray-500">{board.members} membre{board.members && board.members > 1 ? "s" : ""}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">→</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
