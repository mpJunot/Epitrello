import { graphqlRequest } from "@/lib/graphql-client";

export const metadata = {
  title: "Activity",
};

type ActivityItem = {
  id: string;
  description?: string | null;
  createdAt: string;
};

async function fetchActivity(): Promise<ActivityItem[]> {
  const query = `
    query Activities {
      activities {
        id
        description
        createdAt
      }
    }
  `;

  try {
    const result = await graphqlRequest<{ activities?: ActivityItem[] | null }>(query);
    return (result.activities || []).filter(Boolean);
  } catch {
    // Silently fall back to empty state; no console noise.
    return [];
  }
}

export default async function ActivityPage() {
  const activity = await fetchActivity();

  const sorted = [...activity].sort((a, b) => {
    const da = Date.parse(a.createdAt);
    const db = Date.parse(b.createdAt);
    return db - da;
  });

  return (
    <main className="p-6 w-full h-full overflow-auto">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-semibold">Activity</h1>
        <p className="text-sm text-muted-foreground">Most recent events first.</p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground bg-muted/30">
          No activity to display yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {sorted.map((item) => (
            <li key={item.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="text-sm font-medium text-foreground">{item.description || "Activity"}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
