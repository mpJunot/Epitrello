 'use client';
import React, { useEffect, useState } from 'react';
 import { useParams } from 'next/navigation';
 import Link from 'next/link';
 import BoardView from '../../../components/BoardView';
import { getBoard } from '@/lib/actions/boards';
import { createList, updateList, reorderLists, deleteList } from '@/lib/actions/lists';
import { createCard, moveCard, reorderCards, updateCard, deleteCard, assignMemberToCard, unassignMemberFromCard } from '@/lib/actions/cards';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const load = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log('🔄 Loading board from backend:', boardId);
          // Fetch board from backend with lists and cards
          const b = await getBoard(boardId);
          console.log('✅ Board loaded:', b);
          
          // Map backend fields to local shape (title -> name)
          const mappedBoard: Board = {
            id: b.id,
            name: b.title,
            title: b.title,
            description: b.description || undefined,
            background: b.background,
            lists: b.lists || [],
          };
          setBoard(mappedBoard);

          // Load lists with cards from backend
          const loadedLists: List[] = (b.lists || []).map((list) => ({
            id: list.id,
            title: list.title,
            position: list.position,
            cards: (list.cards || []).map((card) => ({
              id: card.id,
              title: card.title,
              description: card.description,
            })),
          }));
          
          console.log('📋 Lists loaded:', loadedLists.length, 'lists with', loadedLists.reduce((sum, l) => sum + (l.cards?.length || 0), 0), 'cards');
          setLists(loadedLists);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to load board';
          console.error('❌ Failed to load board:', err);
          setError(msg);
          setBoard(null);
        } finally {
          setLoading(false);
        }
      };

      load();
   }, [boardId]);

   useEffect(() => {
     async function onCreate(e: any) {
       const title = e?.detail?.title;
       if (!title) return;
       
       // Validate boardId
       if (!boardId) {
         console.error('No boardId available');
         alert('Error: Board ID is missing');
         window.dispatchEvent(new CustomEvent('epitrello:list-create-error'));
         return;
       }
       
       // Call backend first
       try {
         const position = await new Promise<number>((resolve) => {
           setLists((prev) => {
             resolve(prev.length + 1);
             return prev;
           });
         });
         
         console.log('Creating list with:', { boardId, title, position, boardIdType: typeof boardId });
         const created = await createList({ boardId, title, position });
         console.log('List created successfully:', created);
         
         // Success: add to UI with real backend ID
         setLists((prevLists) => [
           ...prevLists,
           { id: created.id, title: created.title, position: created.position, cards: [] }
         ]);
         
         // Notify success
         window.dispatchEvent(new CustomEvent('epitrello:list-create-success'));
       } catch (err) {
         console.error('Failed to create list:', err);
         const msg = err instanceof Error ? err.message : 'Failed to create list';
         alert(`Error creating list: ${msg}`);
         // Notify error
         window.dispatchEvent(new CustomEvent('epitrello:list-create-error'));
       }
     }

     async function onCardCreated(e: any) {
       const detail = e?.detail;
       if (!detail) return;
       const { listId, card } = detail;
       
       // Call backend first
       try {
         const created = await createCard({ listId, title: card?.title || 'Card', description: card?.description });
         
         // Success: add to UI with real backend ID
         setLists((prevLists) => prevLists.map((lst) => 
           lst.id === listId 
             ? { ...lst, cards: [{ id: created.id, title: created.title, description: created.description }, ...(lst.cards || [])] } 
             : lst
         ));
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'Failed to create card';
         alert(msg);
       }
     }

    function onListUpdated(e: any) {
      const detail = e?.detail;
      if (!detail) return;
      const { listId, title } = detail;
      if (!listId) return;
      
      setLists((prevLists) => prevLists.map((lst) => lst.id === listId ? { ...lst, title } : lst));

      // Sync with backend
      (async () => {
        try {
          await updateList({ id: listId, title });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to update list';
          alert(msg);
          // revert title - need to capture original
          setLists((prev) => prev.map((lst) => lst.id === listId ? { ...lst, title: prev.find(l => l.id === listId)?.title || lst.title } : lst));
        }
      })();
    }

    function onCardMove(e: any) {
      const d = e?.detail;
      if (!d) return;
      const { cardId, fromListId, toListId, toIndex } = d;
      if (!cardId || !fromListId || !toListId) return;

      setLists((prevLists) => {
        // find source and destination
        const src = prevLists.find((l) => l.id === fromListId);
        const dst = prevLists.find((l) => l.id === toListId);
        if (!src || !dst) return prevLists;

        // remove from source
        const card = (src.cards || []).find((c) => c.id === cardId);
        if (!card) return prevLists;
        const newSrcCards = (src.cards || []).filter((c) => c.id !== cardId);

        // insert into destination at toIndex (or push at end)
        const dstCards = Array.from(dst.cards || []);
        const insertAt = typeof toIndex === 'number' ? Math.min(Math.max(0, toIndex), dstCards.length) : dstCards.length;
        dstCards.splice(insertAt, 0, card);

        return prevLists.map((l) => {
          if (l.id === fromListId) return { ...l, cards: newSrcCards };
          if (l.id === toListId) return { ...l, cards: dstCards };
          return l;
        });
      });

      // Sync with backend (move/reorder)
      (async () => {
        try {
          const currentLists = await new Promise<List[]>((resolve) => {
            setLists((prev) => {
              resolve(prev);
              return prev;
            });
          });
          
          const src = currentLists.find((l) => l.id === fromListId);
          const dst = currentLists.find((l) => l.id === toListId);
          if (!src || !dst) return;

          const dstCards = dst.cards || [];
          const insertAt = typeof toIndex === 'number' ? Math.min(Math.max(0, toIndex), dstCards.length) : dstCards.length;

          if (fromListId === toListId) {
            const cardPositions = dstCards.map((c, idx) => ({ id: c.id, position: idx + 1 }));
            await reorderCards({ listId: toListId, cardPositions });
          } else {
            const position = insertAt + 1;
            await moveCard({ cardId, targetListId: toListId, position });
            // Reorder target list after move
            const cardPositions = dstCards.map((c, idx) => ({ id: c.id, position: idx + 1 }));
            await reorderCards({ listId: toListId, cardPositions });
            const srcCards = src.cards || [];
            const srcPositions = srcCards.filter(c => c.id !== cardId).map((c, idx) => ({ id: c.id, position: idx + 1 }));
            await reorderCards({ listId: fromListId, cardPositions: srcPositions });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to move card';
          alert(msg);
        }
      })();
    }

    function onListMoved(e: any) {
      const d = e?.detail;
      if (!d) return;
      const { listId, newPosition } = d;
      
      setLists((prevLists) => {
        const currentIndex = prevLists.findIndex((l) => l.id === listId);
        if (currentIndex === -1) return prevLists;
        const updated = prevLists.filter((l) => l.id !== listId);
        const pos = Math.min(Math.max(0, Number(newPosition) || 0), updated.length);
        updated.splice(pos, 0, prevLists[currentIndex]);
        return updated.map((l, idx) => ({ ...l, position: idx + 1 }));
      });

      // Sync reorder
      (async () => {
        try {
          const currentLists = await new Promise<List[]>((resolve) => {
            setLists((prev) => {
              resolve(prev);
              return prev;
            });
          });
          const listPositions = currentLists.map((l) => ({ id: l.id, position: l.position || 0 }));
          await reorderLists({ boardId, listPositions });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to reorder lists';
          alert(msg);
        }
      })();
    }

    function onListCopied(e: any) {
      const d = e?.detail;
      if (!d) return;
      const { newListTitle, cards: cardsToCopy } = d;
      const tempId = (crypto as any)?.randomUUID ? (crypto as any).randomUUID() : String(Date.now());
      
      let position = 1;
      setLists((prevLists) => {
        position = (prevLists.length || 0) + 1;
        const newList: List = { id: tempId, title: newListTitle, position, cards: cardsToCopy || [] };
        return [...prevLists, newList];
      });

      // Sync with backend - create list then create cards
      (async () => {
        try {
          const created = await createList({ boardId, title: newListTitle, position });
          // Update list ID
          setLists((prev) => prev.map((l) => (l.id === tempId ? { ...l, id: created.id } : l)));
          
          // Create cards if any
          if (cardsToCopy && cardsToCopy.length > 0) {
            for (const card of cardsToCopy) {
              try {
                await createCard({ listId: created.id, title: card.title, description: card.description });
              } catch (cardErr) {
                console.error('Failed to copy card:', cardErr);
              }
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to copy list';
          alert(msg);
          setLists((prev) => prev.filter((l) => l.id !== tempId));
        }
      })();
    }

    function onMoveAllCards(e: any) {
      const d = e?.detail;
      if (!d) return;
      const { sourceListId, targetListId, cards: cardsToMove } = d;
      
      // Update local state
      setLists((prevLists) => prevLists.map((l) => {
        if (l.id === sourceListId) return { ...l, cards: [] };
        if (l.id === targetListId) return { ...l, cards: [...(l.cards || []), ...(cardsToMove || [])] };
        return l;
      }));

      // Sync with backend - move each card
      (async () => {
        if (!cardsToMove || cardsToMove.length === 0) return;
        try {
          for (const card of cardsToMove) {
            await moveCard({ cardId: card.id, targetListId });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to move cards';
          alert(msg);
        }
      })();
    }

    async function onListDeleted(e: any) {
      const d = e?.detail;
      if (!d) return;
      const { listId } = d;
      
      // Remove from local state
      setLists((prevLists) => prevLists.filter((l) => l.id !== listId));

      // Sync with backend
      try {
        console.log('🗑️ Deleting list:', listId);
        await deleteList(listId);
        console.log('✅ List deleted from backend');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete list';
        console.error('❌ Failed to delete list:', err);
        alert(`Error deleting list: ${msg}`);
        // Revert: reload the board to restore the list
        window.location.reload();
      }
    }

    async function onCardTitleUpdated(e: any) {
      const d = e?.detail;
      if (!d) return;
      const { cardId, title } = d;
      
      console.log('📥 BoardPage: Received card-title-updated event:', { cardId, title });
      
      // Update local state
      setLists((prevLists) => {
        const updated = prevLists.map((lst) => ({
          ...lst,
          cards: (lst.cards || []).map((c) => c.id === cardId ? { ...c, title } : c)
        }));
        console.log('🔄 BoardPage: State updated, new lists:', updated);
        return updated;
      });

      // Sync with backend
      try {
        console.log('✏️ Updating card title:', { cardId, title });
        await updateCard({ id: cardId, title });
        console.log('✅ Card title updated in backend');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update card title';
        console.error('❌ Failed to update card title:', err);
        alert(`Error updating card: ${msg}`);
      }
    }

    async function onCardDescriptionUpdated(e: any) {
      const d = e?.detail;
      if (!d) return;
      const { cardId, description } = d;
      
      // Update local state
      setLists((prevLists) => prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).map((c) => c.id === cardId ? { ...c, description } : c)
      })));

      // Sync with backend
      try {
        console.log('✏️ Updating card description:', cardId);
        await updateCard({ id: cardId, description });
        console.log('✅ Card description updated in backend');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update card description';
        console.error('❌ Failed to update card description:', err);
        alert(`Error updating card: ${msg}`);
      }
    }

    async function onCardDueDateUpdated(e: any) {
      const d = e?.detail;
      if (!d) return;
      const { cardId, dueDate } = d;
      
      // Note: We don't store dueDate in local state currently
      // But we still sync with backend
      try {
        console.log('📅 Updating card due date:', { cardId, dueDate });
        await updateCard({ id: cardId, dueDate: dueDate?.date });
        console.log('✅ Card due date updated in backend');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update card due date';
        console.error('❌ Failed to update card due date:', err);
        alert(`Error updating card: ${msg}`);
      }
    }

    async function onCardDeleted(e: any) {
      const d = e?.detail;
      if (!d) return;
      const { cardId } = d;
      
      // Remove from local state
      setLists((prevLists) => prevLists.map((lst) => ({
        ...lst,
        cards: (lst.cards || []).filter((c) => c.id !== cardId)
      })));

      // Sync with backend
      try {
        console.log('🗑️ Deleting card:', cardId);
        await deleteCard(cardId);
        console.log('✅ Card deleted from backend');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete card';
        console.error('❌ Failed to delete card:', err);
        alert(`Error deleting card: ${msg}`);
        // Revert: reload the board
        window.location.reload();
      }
    }

    // Note: Members, labels, checklists, comments are not yet supported by backend
    // These events are handled locally in CardModal for now

     window.addEventListener('epitrello:list-create', onCreate as EventListener);
     window.addEventListener('epitrello:card-created', onCardCreated as EventListener);
    window.addEventListener('epitrello:card-move', onCardMove as EventListener);
    window.addEventListener('epitrello:list-updated', onListUpdated as EventListener);
    window.addEventListener('epitrello:list-moved', onListMoved as EventListener);
    window.addEventListener('epitrello:list-copied', onListCopied as EventListener);
    window.addEventListener('epitrello:move-all-cards', onMoveAllCards as EventListener);
    window.addEventListener('epitrello:list-deleted', onListDeleted as EventListener);
    window.addEventListener('epitrello:card-title-updated', onCardTitleUpdated as EventListener);
    window.addEventListener('epitrello:card-description-updated', onCardDescriptionUpdated as EventListener);
    window.addEventListener('epitrello:card-duedate-updated', onCardDueDateUpdated as EventListener);
    window.addEventListener('epitrello:card-deleted', onCardDeleted as EventListener);
     return () => {
       window.removeEventListener('epitrello:list-create', onCreate as EventListener);
       window.removeEventListener('epitrello:card-created', onCardCreated as EventListener);
      window.removeEventListener('epitrello:card-move', onCardMove as EventListener);
      window.removeEventListener('epitrello:list-updated', onListUpdated as EventListener);
      window.removeEventListener('epitrello:list-moved', onListMoved as EventListener);
      window.removeEventListener('epitrello:list-copied', onListCopied as EventListener);
      window.removeEventListener('epitrello:move-all-cards', onMoveAllCards as EventListener);
      window.removeEventListener('epitrello:list-deleted', onListDeleted as EventListener);
      window.removeEventListener('epitrello:card-title-updated', onCardTitleUpdated as EventListener);
      window.removeEventListener('epitrello:card-description-updated', onCardDescriptionUpdated as EventListener);
      window.removeEventListener('epitrello:card-duedate-updated', onCardDueDateUpdated as EventListener);
      window.removeEventListener('epitrello:card-deleted', onCardDeleted as EventListener);
     };
   }, [boardId]); // Only depend on boardId, not lists

   if (loading) {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="flex items-center gap-3 text-gray-600">
           <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
           <span>Chargement du board...</span>
         </div>
       </div>
     );
   }

   if (error || board === null) {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="text-center">
           <div className="text-gray-400 mb-4">
             <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
           </div>
           <h2 className="text-xl font-semibold text-gray-900 mb-2">Board not found</h2>
           <p className="text-gray-500 mb-4">{error ?? "The board you're looking for doesn't exist or has been deleted."}</p>
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