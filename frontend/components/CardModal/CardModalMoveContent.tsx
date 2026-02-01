'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label as LabelComponent } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type MoveCardContentProps = {
  selectedBoardId: string;
  setSelectedBoardId: (id: string) => void;
  selectedListId: string;
  setSelectedListId: (id: string) => void;
  selectedPosition: string;
  setSelectedPosition: (pos: string) => void;
  availableLists: Array<{ id: string; name: string }>;
  availableBoards?: Array<{
    id: string;
    name: string;
    workspaceId: string;
    workspaceName: string;
  }>;
  currentBoardId?: string;
  handleMoveCard: () => void;
  setIsMovePopoverOpen: (open: boolean) => void;
};

export function CardModalMoveContent({
  selectedBoardId,
  setSelectedBoardId,
  selectedListId,
  setSelectedListId,
  selectedPosition,
  setSelectedPosition,
  availableLists,
  availableBoards,
  currentBoardId,
  handleMoveCard,
  setIsMovePopoverOpen,
}: MoveCardContentProps) {
  return (
    <>
      <div className='mb-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold'>Move card</h3>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={() => setIsMovePopoverOpen(false)}
          >
            <X className='w-4 h-4' />
          </Button>
        </div>
      </div>
      <div className='space-y-4'>
        <div>
          <LabelComponent
            htmlFor='board-select'
            className='text-sm font-medium mb-2 block'
          >
            Select destination
          </LabelComponent>
          <div className='space-y-4'>
            <div>
              <LabelComponent
                htmlFor='board'
                className='text-xs text-muted-foreground mb-1 block'
              >
                Board
              </LabelComponent>
              <Select
                value={selectedBoardId}
                onValueChange={setSelectedBoardId}
              >
                <SelectTrigger id='board' className='w-full'>
                  <SelectValue placeholder='Select a board' />
                </SelectTrigger>
                <SelectContent className='border-accent'>
                  {availableBoards && availableBoards.length > 0 ? (
                    (() => {
                      const boardsByWorkspace = availableBoards.reduce(
                        (acc, board) => {
                          if (!acc[board.workspaceId]) {
                            acc[board.workspaceId] = {
                              workspaceName: board.workspaceName,
                              boards: [],
                            };
                          }
                          acc[board.workspaceId].boards.push(board);
                          return acc;
                        },
                        {} as Record<
                          string,
                          {
                            workspaceName: string;
                            boards: typeof availableBoards;
                          }
                        >
                      );

                      const workspaceEntries =
                        Object.entries(boardsByWorkspace);
                      return workspaceEntries.map(
                        ([workspaceId, { workspaceName, boards }], index) => (
                          <SelectGroup key={workspaceId}>
                            <SelectLabel className='text-xs font-semibold text-muted-foreground px-2 py-1.5'>
                              {workspaceName}
                            </SelectLabel>
                            {boards.map((board) => (
                              <SelectItem
                                key={board.id}
                                value={board.id}
                                className='pl-6'
                              >
                                {board.name}
                              </SelectItem>
                            ))}
                            {index < workspaceEntries.length - 1 && (
                              <SelectSeparator />
                            )}
                          </SelectGroup>
                        )
                      );
                    })()
                  ) : currentBoardId ? (
                    <SelectItem value={currentBoardId}>
                      Current Board
                    </SelectItem>
                  ) : (
                    <SelectItem value='' disabled>
                      No boards available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className='flex gap-4'>
              <div className='flex-1'>
                <LabelComponent
                  htmlFor='list'
                  className='text-xs text-muted-foreground mb-1 block'
                >
                  List
                </LabelComponent>
                <Select
                  value={selectedListId}
                  onValueChange={setSelectedListId}
                >
                  <SelectTrigger id='list' className='w-full'>
                    <SelectValue placeholder='Select a list' />
                  </SelectTrigger>
                  <SelectContent className='border-accent'>
                    {availableLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='w-24'>
                <LabelComponent
                  htmlFor='position'
                  className='text-xs text-muted-foreground mb-1 block'
                >
                  Position
                </LabelComponent>
                <Select
                  value={selectedPosition}
                  onValueChange={setSelectedPosition}
                >
                  <SelectTrigger id='position' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='border-accent'>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((pos) => (
                      <SelectItem key={pos} value={pos.toString()}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-4 flex justify-start'>
          <Button
            onClick={() => {
              handleMoveCard();
              setIsMovePopoverOpen(false);
            }}
            disabled={!selectedBoardId || !selectedListId}
            size='sm'
          >
            Move
          </Button>
        </div>
      </div>
    </>
  );
}
