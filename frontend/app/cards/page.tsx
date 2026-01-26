import { graphqlRequest, type GraphQLRequestOptions } from "@/lib/graphql-client";
import { getCurrentUser } from "@/lib/actions/users";

export const metadata = {
  title: "Cards",
};

type RawCard = {
  id: string;
  title: string;
  description?: string | null;
  listId: string;
  position?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  assignees?: Array<{ id: string; name?: string | null; email?: string | null; avatar?: string | null }> | null;
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
  lists?: RawList[] | null;
};

type CardWithBoard = {
  id: string;
  title: string;
  description?: string;
  boardId: string;
  boardTitle: string;
  listId: string;
  listTitle: string;
  updatedAt?: string;
};

const quietOptions: GraphQLRequestOptions = { suppressLogs: true, suppressAuthError: true };

async function fetchWorkspaces() {
  const query = `
    query MyWorkspaces {
      myWorkspaces {
        id
        name
      }
    }
  `;

  try {
    const result = await graphqlRequest<{ myWorkspaces?: Array<{ id: string }> | null }>(query, undefined, quietOptions);
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
            assignees {
              id
              name
              email
              avatar
            }
          }
        }
      }
    }
  `;

  try {
    const result = await graphqlRequest<{ workspaceBoards?: RawBoard[] | null }>(query, { workspaceId }, quietOptions);
    return result.workspaceBoards || [];
  } catch {
    return [];
  }
}

async function fetchUserCards(): Promise<CardWithBoard[]> {
  const P = '[CardsPage]';
  let me = null;
  try {
    me = await getCurrentUser(quietOptions);
  } catch (err) {
    console.error(P, 'getCurrentUser error:', err);
    if (err instanceof Error && err.message === 'UNAUTHORIZED_QUIET') {
      return [];
    }
    return [];
  }

  if (!me) {
    console.log('Server', '❌ No current user found - Backend returned null');
    console.log('Server', '⚠️ Check: Is the token valid? Is the user in the database?');
    return [];
  }
  console.log(P, 'Current user:', { id: me.id, email: me.email, name: me.name });
  const workspaces = await fetchWorkspaces();
  console.log(P, 'Workspaces fetched:', workspaces.length);
  if (!workspaces.length) {
    console.warn(P, 'No workspaces for user', me.id);
    return [];
  }

  const cards: CardWithBoard[] = [];
  let totalBoards = 0;
  let totalLists = 0;
  let totalCards = 0;
  let assignedCards = 0;

  for (const ws of workspaces) {
    console.log(P, 'Fetching boards for workspace', ws.id);
    const boards = await fetchBoards(ws.id);
    console.log(P, 'Boards fetched for workspace', ws.id, ':', boards.length);
    totalBoards += boards.length;
    for (const board of boards) {
      const lists = board.lists || [];
      totalLists += lists.length;
      console.log(P, 'Board', board.id, `"${board.title}"`, 'lists:', lists.length);
      for (const list of lists) {
        const listCards = list.cards || [];
        totalCards += listCards.length;
        console.log(P, '  List', list.id, `"${list.title}"`, 'cards:', listCards.length);
        for (const card of listCards) {
          const assigneeIds = (card.assignees || []).map((a) => a.id);
          const isMine = assigneeIds.includes(me.id);
          // We don't have creator info in the schema, so we filter by assignment only.
          if (!isMine) {
            // Uncomment for very verbos  e logs per card not assigned
            console.log(P, '    Card not assigned to me:', { cardId: card.id, title: card.title });
            continue;
          }

          cards.push({
            id: card.id,
            title: card.title,
            description: card.description || undefined,
            boardId: board.id,
            boardTitle: board.title,
            listId: list.id,
            listTitle: list.title,
            updatedAt: card.updatedAt || card.createdAt || undefined,
          });
          assignedCards++;
          console.log(P, '    ✓ Assigned card found:', { cardId: card.id, title: card.title });
        }
      }
    }
  }

  console.log(P, 'Summary:', { totalBoards, totalLists, totalCards, assignedCards });

  return cards.sort((a, b) => {
    const da = a.updatedAt ? Date.parse(a.updatedAt) : 0;
    const db = b.updatedAt ? Date.parse(b.updatedAt) : 0;
    return db - da;
  });
}

export default async function CardsPage() {
  const cards = await fetchUserCards();

  return (
    <main className="p-6 w-full h-full overflow-auto">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-semibold">Cards</h1>
        <p className="text-sm text-muted-foreground">Cards assigned to you, newest first.</p>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground bg-muted/30">
          No cards assigned to you yet.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.id}>
              <a
                href={`/boards/${card.boardId}`}
                className="block rounded-lg border bg-card p-4 shadow-sm hover:border-primary transition"
              >
                <div className="text-sm font-semibold text-foreground line-clamp-2">{card.title}</div>
                {card.description ? (
                  <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{card.description}</div>
                ) : null}
                <div className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                  <span className="font-medium text-foreground">{card.boardTitle}</span>
                  <span aria-hidden>•</span>
                  <span>{card.listTitle}</span>
                </div>
                {card.updatedAt && (
                  <div className="text-[11px] text-muted-foreground mt-2">Updated {new Date(card.updatedAt).toLocaleString()}</div>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
