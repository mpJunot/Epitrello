 'use client';
 import React, { useEffect, useState } from 'react';
 import { useParams } from 'next/navigation';
 import Link from 'next/link';
 import BoardView from '../../../components/BoardView';

// (types declared below)

 // types
 type Card = { id: string; title: string; description?: string };
 type List = { id: string; title: string; position?: number; cards?: Card[] };
 type Board = { id: string; name: string; title: string; description?: string; background?: string; lists?: List[] };

 export default function BoardPage() {
   const params = useParams();
   const boardId = params.id as string;
   const [board, setBoard] = useState<Board | null>(null);
   const [lists, setLists] = useState<List[]>([]);

   useEffect(() => {
     // load board from localStorage
     try {
       const rawBoards = localStorage.getItem('epitrello_boards');
       const boards = rawBoards ? JSON.parse(rawBoards) as Board[] : [];
       const found = (boards || []).find((b) => String(b.id) === String(boardId));
       if (!found) {
         setBoard(null);
         return;
       }
       setBoard(found);

       // load lists for this board
       const rawLists = localStorage.getItem(`epitrello_lists_${boardId}`);
       let l: List[] = rawLists ? JSON.parse(rawLists) : null;
       if (!l || l.length === 0) {
         // create default lists
         l = [
           { id: `${boardId}-list-1`, title: 'To Do', position: 1, cards: [] },
           { id: `${boardId}-list-2`, title: 'Doing', position: 2, cards: [] },
           { id: `${boardId}-list-3`, title: 'Done', position: 3, cards: [] },
         ];
         try { localStorage.setItem(`epitrello_lists_${boardId}`, JSON.stringify(l)); } catch (e) {}
       }
       setLists(l);
     } catch (e) {
       setBoard(null);
     }
   }, [boardId]);

   useEffect(() => {
     function onCreate(e: any) {
       const title = e?.detail?.title;
       if (!title) return;
       const id = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : String(Date.now());
       const newList: List = { id, title, position: (lists.length || 0) + 1, cards: [] };
       const next = [...lists, newList];
       setLists(next);
       try { localStorage.setItem(`epitrello_lists_${boardId}`, JSON.stringify(next)); } catch (err) {}
     }

     function onCardCreated(e: any) {
       const detail = e?.detail;
       if (!detail) return;
       const { listId, card } = detail;
       const next = lists.map((lst) => lst.id === listId ? { ...lst, cards: [card, ...(lst.cards || [])] } : lst);
       setLists(next);
       try { localStorage.setItem(`epitrello_lists_${boardId}`, JSON.stringify(next)); } catch (err) {}
     }

    function onListUpdated(e: any) {
      const detail = e?.detail;
      if (!detail) return;
      const { listId, title } = detail;
      if (!listId) return;
      const next = lists.map((lst) => lst.id === listId ? { ...lst, title } : lst);
      setLists(next);
      try { localStorage.setItem(`epitrello_lists_${boardId}`, JSON.stringify(next)); } catch (err) {}
    }

    function onCardMove(e: any) {
      const d = e?.detail;
      if (!d) return;
      const { cardId, fromListId, toListId, toIndex } = d;
      if (!cardId || !fromListId || !toListId) return;

      // find source and destination
      const src = lists.find((l) => l.id === fromListId);
      const dst = lists.find((l) => l.id === toListId);
      if (!src || !dst) return;

      // remove from source
      const card = (src.cards || []).find((c) => c.id === cardId);
      if (!card) return;
      const newSrcCards = (src.cards || []).filter((c) => c.id !== cardId);

      // insert into destination at toIndex (or push at end)
      const dstCards = Array.from(dst.cards || []);
      const insertAt = typeof toIndex === 'number' ? Math.min(Math.max(0, toIndex), dstCards.length) : dstCards.length;
      dstCards.splice(insertAt, 0, card);

      const next = lists.map((l) => {
        if (l.id === fromListId) return { ...l, cards: newSrcCards };
        if (l.id === toListId) return { ...l, cards: dstCards };
        return l;
      });
      setLists(next);
      try { localStorage.setItem(`epitrello_lists_${boardId}`, JSON.stringify(next)); } catch (err) {}
    }

     window.addEventListener('epitrello:list-create', onCreate as EventListener);
     window.addEventListener('epitrello:card-created', onCardCreated as EventListener);
    window.addEventListener('epitrello:card-move', onCardMove as EventListener);
    window.addEventListener('epitrello:list-updated', onListUpdated as EventListener);
     return () => {
       window.removeEventListener('epitrello:list-create', onCreate as EventListener);
       window.removeEventListener('epitrello:card-created', onCardCreated as EventListener);
      window.removeEventListener('epitrello:card-move', onCardMove as EventListener);
      window.removeEventListener('epitrello:list-updated', onListUpdated as EventListener);
     };
   }, [lists, boardId]);

   if (board === null) {
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

  const composedBoard: Board = { ...board, lists, title: board.name };

   return (
     <div className="min-h-screen bg-gray-50">
       <header className={`relative h-32 ${board.background || 'bg-gray-300'} flex items-end p-6 text-white`}>
         <div className="absolute inset-0 bg-black bg-opacity-20" />
         <div className="relative z-10">
           <h1 className="text-2xl font-bold mb-1">{board.name}</h1>
           {board.description && (
             <p className="text-white text-opacity-90">{board.description}</p>
           )}
         </div>
       </header>

       <main className="p-6">
         <BoardView board={composedBoard} />
       </main>
     </div>
   );
 }