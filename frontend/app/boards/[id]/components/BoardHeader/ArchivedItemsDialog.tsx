'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item';
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { getArchivedLists, unarchiveList } from '@/lib/actions/lists';
import { getArchivedCards, unarchiveCard } from '@/lib/actions/cards';
import { toast } from '@/lib/toast';
import { Archive, CreditCard, List as ListIcon } from 'lucide-react';
import type { List } from '../../types';
import type { Card } from '@/lib/actions/cards';

interface ArchivedItemsContentProps {
  boardId: string;
  onRestore?: () => void;
}

export function ArchivedItemsContent({
  boardId,
  onRestore,
}: ArchivedItemsContentProps) {
  const [archivedLists, setArchivedLists] = useState<List[]>([]);
  const [archivedCards, setArchivedCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringListId, setRestoringListId] = useState<string | null>(null);
  const [restoringCardId, setRestoringCardId] = useState<string | null>(null);

  useEffect(() => {
    if (boardId) {
      setLoading(true);
      Promise.all([getArchivedLists(boardId), getArchivedCards(boardId)])
        .then(([lists, cards]) => {
          setArchivedLists(
            lists.map((l) => ({ ...l, position: l.position ?? 0 }) as List),
          );
          setArchivedCards(cards);
        })
        .catch(() => {
          toast.error('Failed to load archived items');
          setArchivedLists([]);
          setArchivedCards([]);
        })
        .finally(() => setLoading(false));
    }
  }, [boardId]);

  const handleRestoreList = async (listId: string) => {
    setRestoringListId(listId);
    try {
      await unarchiveList(listId);
      toast.success('List restored');
      setArchivedLists((prev) => prev.filter((l) => l.id !== listId));
      onRestore?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to restore list';
      toast.error(message);
    } finally {
      setRestoringListId(null);
    }
  };

  const handleRestoreCard = async (cardId: string) => {
    setRestoringCardId(cardId);
    try {
      await unarchiveCard(cardId);
      toast.success('Card restored');
      setArchivedCards((prev) => prev.filter((c) => c.id !== cardId));
      onRestore?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to restore card';
      toast.error(message);
    } finally {
      setRestoringCardId(null);
    }
  };

  return (
    <Tabs defaultValue='cards' className='w-full'>
      <TabsList className='w-full rounded-none border-b border-accent bg-transparent p-0 h-auto'>
        <TabsTrigger
          value='cards'
          className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5'
        >
          Cards
          {archivedCards.length > 0 && (
            <span className='ml-1.5 text-muted-foreground text-xs'>
              ({archivedCards.length})
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value='lists'
          className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5'
        >
          Lists
          {archivedLists.length > 0 && (
            <span className='ml-1.5 text-muted-foreground text-xs'>
              ({archivedLists.length})
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      <div className='max-h-[320px] overflow-y-auto'>
        <TabsContent value='cards' className='m-0 p-2'>
          {loading ? (
            <Empty className='py-8 md:py-8'>
              <EmptyContent>
                <EmptyDescription>Loading...</EmptyDescription>
              </EmptyContent>
            </Empty>
          ) : archivedCards.length === 0 ? (
            <Empty className='py-8 md:py-8'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <CreditCard />
                </EmptyMedia>
                <EmptyTitle>No archived cards</EmptyTitle>
                <EmptyDescription>
                  Cards you archive will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ItemGroup className='gap-1'>
              {archivedCards.map((card) => (
                <Item
                  key={card.id}
                  size='sm'
                  variant='outline'
                  className='cursor-default rounded-md hover:bg-accent/50 transition-colors border-accent'
                >
                  <ItemContent>
                    <ItemTitle className='truncate'>{card.title}</ItemTitle>
                    <ItemDescription className='line-clamp-2 text-xs'>
                      {card.description?.trim() || 'No description'}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleRestoreCard(card.id)}
                      disabled={restoringCardId === card.id}
                      className='border-accent'
                    >
                      {restoringCardId === card.id ? 'Restoring…' : 'Restore'}
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </TabsContent>
        <TabsContent value='lists' className='m-0 p-2'>
          {loading ? (
            <Empty className='py-8 md:py-8'>
              <EmptyContent>
                <EmptyDescription>Loading...</EmptyDescription>
              </EmptyContent>
            </Empty>
          ) : archivedLists.length === 0 ? (
            <Empty className='py-8 md:py-8'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <ListIcon />
                </EmptyMedia>
                <EmptyTitle>No archived lists</EmptyTitle>
                <EmptyDescription>
                  Lists you archive will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ItemGroup className='gap-1'>
              {archivedLists.map((list) => (
                <Item
                  key={list.id}
                  size='sm'
                  variant='outline'
                  className='cursor-default rounded-md hover:bg-accent/50 transition-colors border-accent'
                >
                  <ItemContent>
                    <ItemTitle className='truncate'>{list.title}</ItemTitle>
                    <ItemDescription className='line-clamp-2 text-xs'>
                      {(list as { cards?: unknown[] }).cards?.length ?? 0}{' '}
                      card(s)
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleRestoreList(list.id)}
                      disabled={restoringListId === list.id}
                      className='border-accent'
                    >
                      {restoringListId === list.id ? 'Restoring…' : 'Restore'}
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}

interface ArchivedItemsDialogProps {
  boardId: string;
  onRestore?: () => void;
  trigger?: React.ReactNode;
}

/** Popover wrapper for Archived items */
export function ArchivedItemsDialog({
  boardId,
  onRestore,
  trigger,
}: ArchivedItemsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button
            variant='ghost'
            size='sm'
            className='w-full justify-start gap-2 font-normal'
          >
            <Archive className='w-4 h-4' />
            <span>Archived items</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className='w-[380px] p-0 border-accent'
        align='end'
        sideOffset={8}
      >
        <div className='p-3 border-b border-accent'>
          <h3 className='font-medium text-sm'>Archived items</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            View and restore archived lists and cards
          </p>
        </div>
        <ArchivedItemsContent boardId={boardId} onRestore={onRestore} />
      </PopoverContent>
    </Popover>
  );
}
