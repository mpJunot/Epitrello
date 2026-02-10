import {
  graphqlRequest,
  type GraphQLRequestOptions,
} from '@/lib/graphql-client';
import { getCurrentUser } from '@/lib/actions/users';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import { LayoutGrid } from 'lucide-react';
import { CardsTable, type CardRow } from './CardsTable';

export const metadata = {
  title: 'Cards',
};

/** Skip static prerender at build time; this page needs the backend (current user, workspaces). */
export const dynamic = 'force-dynamic';

type RawLabel = {
  id: string;
  name?: string | null;
  color?: string | null;
};

type RawCard = {
  id: string;
  title: string;
  description?: string | null;
  listId: string;
  position?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  dueDate?: string | null;
  completed?: boolean | null;
  assignees?: Array<{
    id: string;
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
  }> | null;
  labels?: RawLabel[] | null;
};

type RawList = {
  id: string;
  title: string;
  position?: number | null;
  cards?: RawCard[] | null;
};

type RawBoard = {
  id: string;
  title: string;
  workspaceId?: string | null;
  background?: string | null;
  lists?: RawList[] | null;
};

type WorkspaceWithName = { id: string; name: string };

const quietOptions: GraphQLRequestOptions = {
  suppressLogs: true,
  suppressAuthError: true,
};

async function fetchWorkspaces(): Promise<WorkspaceWithName[]> {
  const query = `
    query MyWorkspaces {
      myWorkspaces {
        id
        name
      }
    }
  `;

  try {
    const result = await graphqlRequest<{
      myWorkspaces?: WorkspaceWithName[] | null;
    }>(query, undefined, quietOptions);
    return result.myWorkspaces || [];
  } catch {
    return [];
  }
}

async function fetchBoards(workspaceId: string) {
  const query = `
    query WorkspaceBoards($workspaceId: ID!) {
      workspaceBoards(workspaceId: $workspaceId) {
        id
        title
        workspaceId
        background
        lists {
          id
          title
          position
          cards {
            id
            title
            description
            listId
            position
            createdAt
            updatedAt
            dueDate
            completed
            assignees {
              id
              name
              email
              avatar
            }
            labels {
              id
              name
              color
            }
          }
        }
      }
    }
  `;

  try {
    const result = await graphqlRequest<{
      workspaceBoards?: RawBoard[] | null;
    }>(query, { workspaceId }, quietOptions);
    return result.workspaceBoards || [];
  } catch {
    return [];
  }
}

type CardsPageData = { cards: CardRow[]; currentUserId: string | null };

async function fetchAllCards(): Promise<CardsPageData> {
  let me = null;
  try {
    me = await getCurrentUser(quietOptions);
  } catch {
    return { cards: [], currentUserId: null };
  }
  if (!me) return { cards: [], currentUserId: null };

  const workspaces = await fetchWorkspaces();
  if (!workspaces.length) return { cards: [], currentUserId: me.id };

  const workspaceNames = new Map(workspaces.map((w) => [w.id, w.name]));
  const cards: CardRow[] = [];

  for (const ws of workspaces) {
    const boards = await fetchBoards(ws.id);
    const workspaceName = workspaceNames.get(ws.id) ?? ws.name;
    for (const board of boards) {
      const lists = board.lists || [];
      for (const list of lists) {
        const listCards = list.cards || [];
        for (const card of listCards) {
          cards.push({
            id: card.id,
            title: card.title,
            boardId: board.id,
            boardTitle: board.title,
            boardBackground: board.background ?? undefined,
            listId: list.id,
            listTitle: list.title,
            dueDate: card.dueDate ?? undefined,
            completed: card.completed ?? false,
            labels: card.labels ?? undefined,
            assigneeIds: (card.assignees ?? []).map((a) => a.id),
            workspaceName,
          });
        }
      }
    }
  }

  cards.sort((a, b) => {
    const da = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const db = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    if (da !== db) return da - db;
    return (
      a.boardTitle.localeCompare(b.boardTitle) || a.title.localeCompare(b.title)
    );
  });

  return { cards, currentUserId: me.id };
}

export default async function CardsPage() {
  const { cards, currentUserId } = await fetchAllCards();

  return (
    <main className='flex h-full w-full flex-col p-8 md:p-12 overflow-auto'>
      <div className='flex min-h-0 flex-1 flex-col gap-6 w-full max-w-5xl'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold'>Cards</h1>
          <p className='text-sm text-muted-foreground'>
            All cards across your boards. Sort by board, list, or due date.
            Filter by board, list, labels, due date, or assignee.
          </p>
        </div>

        {cards.length === 0 ? (
          <Empty className='rounded-lg bg-muted/30'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <LayoutGrid className='size-6' />
              </EmptyMedia>
              <EmptyTitle>No cards yet</EmptyTitle>
              <EmptyDescription>
                Create cards on your boards and they will appear here
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <CardsTable cards={cards} currentUserId={currentUserId} />
        )}
      </div>
    </main>
  );
}
