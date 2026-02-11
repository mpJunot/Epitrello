'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useQueries } from '@tanstack/react-query';
import {
  createBoard as createBoardAction,
  Visibility,
} from '@/lib/actions/boards';
import Image from 'next/image';
import {
  AlertTriangle,
  LayoutGrid,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspacesQuery } from '@/lib/queries/workspaces';
import {
  workspaceBoardsQueryKey,
  workspaceBoardsQueryOptions,
} from '@/lib/queries/workspaces';

type Board = {
  id: string;
  name: string;
  description?: string;
  background?: string;
  members?: number;
  workspaceId?: string;
  visibility?: 'personal' | 'workspace' | 'public';
};

function mapGqlToBoard(b: {
  id: string;
  title: string;
  description?: string;
  background?: string;
  members?: { id: string }[];
  workspaceId?: string;
}): Board {
  return {
    id: b.id,
    name: b.title,
    description: b.description || undefined,
    background: b.background,
    members: b.members ? b.members.length : undefined,
    workspaceId: b.workspaceId,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [newBoardNameByWorkspace, setNewBoardNameByWorkspace] = useState<
    Record<string, string>
  >({});
  const [newBoardDescByWorkspace, setNewBoardDescByWorkspace] = useState<
    Record<string, string>
  >({});
  const [newBoardVisibilityByWorkspace, setNewBoardVisibilityByWorkspace] =
    useState<Record<string, 'personal' | 'workspace' | 'public' | undefined>>(
      {},
    );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    boardId: string | null;
    boardName: string;
    workspaceId: string | null;
  }>({
    show: false,
    boardId: null,
    boardName: '',
    workspaceId: null,
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: wsFromApi } = useWorkspacesQuery(true);
  const workspaces = (wsFromApi ?? []).map((w) => ({
    id: w.id,
    title: w.name,
  }));

  const boardQueries = useQueries({
    queries: workspaces.map((ws) => workspaceBoardsQueryOptions(ws.id)),
  });
  const boardResultsByWsId = useMemo(() => {
    const m: Record<
      string,
      {
        data?: unknown[];
        isLoading: boolean;
        error: Error | null;
        refetch: () => void;
      }
    > = {};
    workspaces.forEach((ws, i) => {
      m[ws.id] = {
        data: boardQueries[i]?.data,
        isLoading: boardQueries[i]?.isLoading ?? false,
        error: boardQueries[i]?.error as Error | null,
        refetch: boardQueries[i]?.refetch ?? (() => {}),
      };
    });
    return m;
  }, [workspaces, boardQueries]);

  const chartData = useMemo(() => {
    const barData = workspaces.map((ws) => {
      const br = boardResultsByWsId[ws.id];
      const list = (br?.data ?? []) as unknown[];
      return {
        workspace: ws.title,
        boards: list.length,
        fill: 'var(--trello-blue)',
      };
    });
    const pieData = barData
      .map((d) => ({
        name: d.workspace,
        value: d.boards,
        fill: 'var(--trello-blue)',
      }))
      .filter((d) => d.value > 0);
    return { barData, pieData };
  }, [workspaces, boardResultsByWsId]);

  const barChartConfig = useMemo<ChartConfig>(
    () => ({
      boards: { label: 'Boards', color: 'var(--trello-blue)' },
      workspace: { label: 'Workspace' },
    }),
    [],
  );

  const pieChartConfig = useMemo<ChartConfig>(
    () => ({
      boards: { label: 'Boards' },
    }),
    [],
  );

  const createBoard = async (
    workspaceId?: string,
    name?: string,
    desc?: string,
    visibility?: 'personal' | 'workspace' | 'public',
  ) => {
    const boardName = (name ?? newBoardName).trim();
    if (!boardName) return;

    const visMap: Record<'personal' | 'workspace' | 'public', Visibility> = {
      personal: 'PRIVATE',
      workspace: 'WORKSPACE',
      public: 'PUBLIC',
    };

    const newBoard = await createBoardAction({
      title: boardName,
      description: (desc ?? newBoardDescription).trim() || undefined,
      visibility: visibility ? visMap[visibility] : undefined,
      workspaceId: workspaceId || (workspaces[0] && workspaces[0].id),
    });

    const workspaceIdKey = newBoard.workspaceId ?? workspaceId ?? '';
    if (workspaceIdKey) {
      await queryClient.invalidateQueries({
        queryKey: workspaceBoardsQueryKey(workspaceIdKey),
      });
    }
    setNewBoardName('');
    setNewBoardDescription('');
  };

  const confirmDeleteBoard = () => {
    if (deleteConfirm.boardId && deleteConfirm.workspaceId) {
      const wsId = deleteConfirm.workspaceId;
      const boardId = deleteConfirm.boardId;
      queryClient.setQueryData(
        workspaceBoardsQueryKey(wsId),
        (old: { id: string }[] | undefined) =>
          (old || []).filter((b) => b.id !== boardId),
      );
      setFeedback(`Board "${deleteConfirm.boardName}" has been deleted`);
      setTimeout(() => setFeedback(null), 3000);
    }
    setDeleteConfirm({
      show: false,
      boardId: null,
      boardName: '',
      workspaceId: null,
    });
  };

  const cancelDeleteBoard = () => {
    setDeleteConfirm({
      show: false,
      boardId: null,
      boardName: '',
      workspaceId: null,
    });
  };

  return (
    <div className='min-h-screen bg-background p-6 text-trello'>
      <header className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <div className='h-10 w-10 rounded bg-trello-blue flex items-center justify-center text-white font-bold'>
            E
          </div>
          <h1 className='text-2xl font-semibold text-trello'>Epitrello</h1>
        </div>
      </header>

      <main>
        {workspaces.length > 0 && (
          <section className='mb-8'>
            <h2 className='text-lg font-medium mb-4 text-trello'>Overview</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='rounded-lg border border-accent bg-card p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <BarChart3 className='h-5 w-5 text-muted-foreground' />
                  <span className='text-sm font-medium'>
                    Boards per workspace
                  </span>
                </div>
                <ChartContainer
                  config={barChartConfig}
                  className='h-[240px] w-full'
                >
                  <BarChart
                    data={chartData.barData}
                    margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      className='stroke-muted'
                    />
                    <XAxis dataKey='workspace' tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent className='border-accent' />
                      }
                      cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey='boards' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
              <div className='rounded-lg border border-accent bg-card p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <PieChartIcon className='h-5 w-5 text-muted-foreground' />
                  <span className='text-sm font-medium'>
                    Board distribution
                  </span>
                </div>
                {chartData.pieData.length > 0 ? (
                  <ChartContainer
                    config={pieChartConfig}
                    className='h-[240px] w-full'
                  >
                    <PieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent className='border-accent' />
                        }
                      />
                      <Pie
                        data={chartData.pieData}
                        dataKey='value'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {chartData.pieData.map((_, i) => (
                          <Cell key={i} fill={chartData.pieData[i].fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className='h-[240px] flex items-center justify-center text-muted-foreground text-sm'>
                    No boards to display in the chart
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className='text-lg font-medium mb-4 text-trello'>Workspaces</h2>
          <div className='space-y-6'>
            {workspaces.map((ws) => {
              const br = boardResultsByWsId[ws.id];
              const wsBoards: Board[] = (
                (br?.data ?? []) as {
                  id: string;
                  title: string;
                  description?: string;
                  background?: string;
                  members?: { id: string }[];
                  workspaceId?: string;
                }[]
              ).map(mapGqlToBoard);
              const wsBoardsLoading = br?.isLoading ?? false;
              const wsBoardsError = br?.error?.message ?? null;
              return (
                <div key={ws.id} className='p-2'>
                  <h3 className='text-lg font-semibold text-trello mb-3'>
                    {ws.title}
                  </h3>

                  <div className='flex flex-wrap gap-4 pb-2'>
                    {creatingFor === ws.id && (
                      <div className='min-w-[280px] p-3 bg-trello-card-bg rounded border border-accent shrink-0'>
                        <Input
                          value={newBoardNameByWorkspace[ws.id] ?? ''}
                          onChange={(e) =>
                            setNewBoardNameByWorkspace((s) => ({
                              ...s,
                              [ws.id]: e.target.value,
                            }))
                          }
                          placeholder='Board name'
                          className='w-full mb-2'
                        />
                        <Input
                          value={newBoardDescByWorkspace[ws.id] ?? ''}
                          onChange={(e) =>
                            setNewBoardDescByWorkspace((s) => ({
                              ...s,
                              [ws.id]: e.target.value,
                            }))
                          }
                          placeholder='Description (optional)'
                          className='w-full mb-2'
                        />
                        <div className='mb-2'>
                          <Label className='text-xs mb-1'>Visibility</Label>
                          <div className='flex gap-2'>
                            <Button
                              onClick={() =>
                                setNewBoardVisibilityByWorkspace((s) => ({
                                  ...s,
                                  [ws.id]: 'personal',
                                }))
                              }
                              variant={
                                newBoardVisibilityByWorkspace[ws.id] ===
                                'personal'
                                  ? 'default'
                                  : 'secondary'
                              }
                              size='sm'
                            >
                              Personal
                            </Button>
                            <Button
                              onClick={() =>
                                setNewBoardVisibilityByWorkspace((s) => ({
                                  ...s,
                                  [ws.id]: 'workspace',
                                }))
                              }
                              variant={
                                newBoardVisibilityByWorkspace[ws.id] ===
                                'workspace'
                                  ? 'default'
                                  : 'secondary'
                              }
                              size='sm'
                            >
                              Workspace
                            </Button>
                            <Button
                              onClick={() =>
                                setNewBoardVisibilityByWorkspace((s) => ({
                                  ...s,
                                  [ws.id]: 'public',
                                }))
                              }
                              variant={
                                newBoardVisibilityByWorkspace[ws.id] ===
                                'public'
                                  ? 'default'
                                  : 'secondary'
                              }
                              size='sm'
                            >
                              Public
                            </Button>
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            onClick={async () => {
                              try {
                                await createBoard(
                                  ws.id,
                                  newBoardNameByWorkspace[ws.id],
                                  newBoardDescByWorkspace[ws.id],
                                  newBoardVisibilityByWorkspace[ws.id],
                                );
                                setNewBoardNameByWorkspace((s) => ({
                                  ...s,
                                  [ws.id]: '',
                                }));
                                setNewBoardDescByWorkspace((s) => ({
                                  ...s,
                                  [ws.id]: '',
                                }));
                                setNewBoardVisibilityByWorkspace((s) => ({
                                  ...s,
                                  [ws.id]: undefined,
                                }));
                                setCreatingFor(null);
                              } catch (err) {
                                const msg =
                                  err instanceof Error
                                    ? err.message
                                    : 'Failed to create board';
                                setFeedback(msg);
                                setTimeout(() => setFeedback(null), 3000);
                              }
                            }}
                            size='sm'
                          >
                            Create
                          </Button>
                          <Button
                            onClick={() => {
                              setCreatingFor(null);
                              setNewBoardNameByWorkspace((s) => ({
                                ...s,
                                [ws.id]: '',
                              }));
                              setNewBoardDescByWorkspace((s) => ({
                                ...s,
                                [ws.id]: '',
                              }));
                              setNewBoardVisibilityByWorkspace((s) => ({
                                ...s,
                                [ws.id]: undefined,
                              }));
                            }}
                            variant='secondary'
                            size='sm'
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    {wsBoardsLoading && (
                      <div className='text-trello-secondary text-sm flex items-center gap-2'>
                        <span className='h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin' />
                        Loading boards...
                      </div>
                    )}
                    {!wsBoardsLoading && wsBoardsError && (
                      <div className='text-sm text-red-600 bg-red-50 border border-accent rounded px-3 py-2 flex items-center gap-3'>
                        <span className='font-semibold'>Backend error:</span>
                        <span className='whitespace-pre-wrap wrap-break-word'>
                          {wsBoardsError}
                        </span>
                        <Button
                          onClick={() => br?.refetch()}
                          variant='destructive'
                          size='sm'
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                    {!wsBoardsLoading &&
                      !wsBoardsError &&
                      wsBoards.length === 0 && (
                        <Empty className='py-6 gap-4 rounded-lg border border-dashed'>
                          <EmptyHeader>
                            <EmptyMedia variant='icon'>
                              <LayoutGrid className='size-5' />
                            </EmptyMedia>
                            <EmptyTitle className='text-sm font-medium'>
                              No boards in this workspace
                            </EmptyTitle>
                            <EmptyDescription className='text-xs'>
                              Create a board to get started
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      )}
                    {!wsBoardsLoading &&
                      !wsBoardsError &&
                      wsBoards.length > 0 &&
                      wsBoards.map((board) => {
                        const isImageBackground =
                          !!board.background &&
                          (board.background.startsWith('data:image') ||
                            board.background.startsWith('http') ||
                            board.background.startsWith('https'));

                        return (
                          <div
                            key={board.id}
                            onClick={() => router.push(`/boards/${board.id}`)}
                            className={`min-w-[300px] h-36 rounded-lg overflow-hidden cursor-pointer ${
                              !isImageBackground
                                ? board.background || 'bg-primary'
                                : 'bg-primary'
                            }`}
                          >
                            <div className='relative h-full'>
                              {isImageBackground && (
                                <Image
                                  src={board.background as string}
                                  alt={board.name}
                                  fill
                                  className='object-cover'
                                  unoptimized
                                />
                              )}
                              <div className='absolute inset-0 p-3 text-white flex flex-col justify-between'>
                                <div className='text-sm font-semibold truncate'>
                                  {board.name}
                                </div>
                                {board.members ? (
                                  <div className='text-xs opacity-90'>
                                    {board.members}{' '}
                                    {board.members === 1 ? 'member' : 'members'}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {feedback && (
        <div className='fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'>
          {feedback}
        </div>
      )}

      <Dialog
        open={deleteConfirm.show}
        onOpenChange={(open) => !open && cancelDeleteBoard()}
      >
        <DialogContent className='max-w-md border-accent'>
          <DialogHeader>
            <div className='flex items-center gap-3'>
              <AlertTriangle className='h-6 w-6 text-red-600' />
              <DialogTitle>Delete Board</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className='font-semibold text-trello'>
                &quot;{deleteConfirm.boardName}&quot;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={cancelDeleteBoard} variant='secondary'>
              Cancel
            </Button>
            <Button onClick={confirmDeleteBoard} variant='destructive'>
              Delete Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
