'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Card = {
  id: string;
  title: string;
  description?: string;
};

type List = {
  id: string;
  title: string;
  cards: Card[];
};

type Board = {
  id: string;
  name: string;
  description?: string;
  background?: string;
  lists: List[];
};

// Mock data - in real app this would come from GraphQL
const mockBoards: Record<string, Board> = {
  '1': {
    id: '1',
    name: 'Project Alpha',
    description: 'Main project board',
    background: 'bg-gradient-to-br from-amber-400 to-orange-500',
    lists: [
      {
        id: '1',
        title: 'To Do',
        cards: [
          { id: '1', title: 'Design mockups', description: 'Create wireframes for the new feature' },
          { id: '2', title: 'Setup database', description: 'Initialize PostgreSQL database' },
        ],
      },
      {
        id: '2',
        title: 'In Progress',
        cards: [
          { id: '3', title: 'Implement authentication', description: 'Add login/signup functionality' },
        ],
      },
      {
        id: '3',
        title: 'Done',
        cards: [
          { id: '4', title: 'Project setup', description: 'Initialize Next.js project' },
        ],
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Sprint Q4',
    description: 'Current sprint tasks',
    background: 'bg-gradient-to-br from-sky-400 to-blue-500',
    lists: [
      {
        id: '4',
        title: 'Backlog',
        cards: [
          { id: '5', title: 'Code review', description: 'Review pull requests' },
        ],
      },
      {
        id: '5',
        title: 'Doing',
        cards: [],
      },
    ],
  },
  '3': {
    id: '3',
    name: 'Product Backlog',
    description: 'Future features and improvements',
    background: 'bg-gradient-to-br from-emerald-400 to-green-500',
    lists: [
      {
        id: '6',
        title: 'Ideas',
        cards: [
          { id: '6', title: 'Dark mode', description: 'Implement dark theme' },
          { id: '7', title: 'Mobile app', description: 'Create React Native app' },
        ],
      },
    ],
  },
};

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;
  const board = mockBoards[boardId] || null;

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Board not found</h2>
          <p className="text-gray-500 mb-4">The board you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Board Header */}
      <header className={`relative h-32 ${board.background || 'bg-gray-300'} flex items-end p-6 text-white`}>
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">{board.name}</h1>
          {board.description && (
            <p className="text-white text-opacity-90">{board.description}</p>
          )}
        </div>
      </header>

      {/* Board Content */}
      <main className="p-6">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {board.lists.map((list) => (
            <div
              key={list.id}
              className="bg-gray-100 rounded-lg p-4 min-w-80 max-w-80 flex flex-col"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                {list.title}
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  {list.cards.length}
                </span>
              </h3>

              <div className="space-y-3 flex-1">
                {list.cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white rounded shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h4 className="font-medium text-gray-900 mb-1">{card.title}</h4>
                    {card.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{card.description}</p>
                    )}
                  </div>
                ))}
              </div>

              <button className="mt-3 text-gray-600 hover:text-gray-900 text-sm flex items-center gap-2 p-2 rounded hover:bg-gray-200 transition-colors">
                <span>+</span>
                Add a card
              </button>
            </div>
          ))}

          {/* Add List Button */}
          <div className="min-w-80 max-w-80">
            <button className="w-full bg-gray-100 hover:bg-gray-200 rounded-lg p-4 text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2">
              <span>+</span>
              Add a list
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}